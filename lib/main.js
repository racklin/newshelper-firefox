(function(){
  var self, pageMod, notifications, tabs, Request, indexedDB, ref$, setTimeout, clearTimeout, opened_db, get_time_diff, get_newshelper_db, check_recent_seen, get_recent_report, sync_report_data, log_browsed_link, check_report;
  self = require('self');
  pageMod = require('page-mod');
  notifications = require('sdk/notifications');
  tabs = require('sdk/tabs');
  Request = require('request').Request;
  indexedDB = require('indexed-db').indexedDB;
  ref$ = require('timers'), setTimeout = ref$.setTimeout, clearTimeout = ref$.clearTimeout;
  opened_db = null;
  get_time_diff = function(time){
    var delta;
    delta = Math.floor(new Date().getTime() / 1000) - time;
    switch (true) {
    case delta < 60:
      return delta + " 秒前";
    case delta < 60 * 60:
      return Math.floor(delta / 60) + " 分鐘前";
    case delta < 60 * 60 * 24:
      return Math.floor(delta / 60 / 60) + " 小時前";
    default:
      return Math.floor(delta / 60 / 60 / 24) + " 天前";
    }
  };
  get_newshelper_db = function(cb){
    var request;
    if (opened_db != null) {
      return cb(opened_db);
    }
    request = indexedDB.open('newshelper', '6');
    request.onsuccess = function(event){
      opened_db = request.result;
      return cb(opened_db);
    };
    request.onerror = function(event){
      return console.log("IndexedDB error: " + event.target.errorCode);
    };
    return request.onupgradeneeded = function(event){
      var objectStore;
      try {
        event.currentTarget.result.deleteObjectStore('read_news');
      } catch (e$) {}
      objectStore = event.currentTarget.result.createObjectStore('read_news', {
        keyPath: 'id',
        autoIncrement: true
      });
      objectStore.createIndex('title', 'title', {
        unique: false
      });
      objectStore.createIndex('link', 'link', {
        unique: true
      });
      objectStore.createIndex('last_seen_at', 'last_seen_at', {
        unique: false
      });
      try {
        event.currentTarget.result.deleteObjectStore('report');
      } catch (e$) {}
      objectStore = event.currentTarget.result.createObjectStore('report', {
        keyPath: 'id'
      });
      objectStore.createIndex('news_title', 'news_title', {
        unique: false
      });
      objectStore.createIndex('news_link', 'news_link', {
        unique: false
      });
      return objectStore.createIndex('updated_at', 'updated_at', {
        unique: false
      });
    };
  };
  check_recent_seen = function(report){
    return get_newshelper_db(function(opened_db){
      var transaction, objectStore, index, get_request;
      transaction = opened_db.transaction('read_news', 'readonly');
      objectStore = transaction.objectStore('read_news');
      index = objectStore.index('link');
      get_request = index.get(report.news_link);
      return get_request.onsuccess = function(){
        if (!get_request.result) {
          return;
        }
        if (parseInt(get_request.result.deleted_at, 10)) {
          return;
        }
        return notifications.notify({
          title: '新聞小幫手提醒您',
          text: "您於 " + get_time_diff(get_request.result.last_seen_at) + " 看的新聞「" + get_request.result.title + "」 被人回報有錯誤：" + report.report_title,
          data: report.report_link,
          onClick: function(data){
            return tabs.open(data);
          }
        });
      };
    });
  };
  get_recent_report = function(cb){
    return get_newshelper_db(function(opened_db){
      var transaction, objectStore, index, request;
      transaction = opened_db.transaction('report', 'readonly');
      objectStore = transaction.objectStore('report');
      index = objectStore.index('updated_at');
      request = index.openCursor(null, 'prev');
      return request.onsuccess = function(){
        if (request.result) {
          return cb(request.result.value);
        } else {
          return cb(null);
        }
      };
    });
  };
  sync_report_data = function(){
    return get_newshelper_db(function(opened_db){
      return get_recent_report(function(report){
        var cachedTime, url;
        cachedTime = (report != null ? report.updated_at : void 8) != null ? parseInt(report.updated_at) : 0;
        url = "http://newshelper.g0v.tw/index/data?time=" + cachedTime;
        return Request({
          url: url,
          onComplete: function(response){
            var ret, transaction, objectStore, i;
            ret = response.json;
            transaction = opened_db.transaction('report', 'readwrite');
            objectStore = transaction.objectStore('report');
            if (ret.data) {
              i = 0;
              while (i < ret.data.length) {
                objectStore.put(ret.data[i]);
                check_recent_seen(ret.data[i]);
                i++;
              }
            }
            return setTimeout(sync_report_data, 3600000);
          }
        }).get();
      });
    });
  };
  log_browsed_link = function(link, title){
    if (!link) {
      return;
    }
    return get_newshelper_db(function(opened_db){
      var transaction, objectStore, request, message;
      transaction = opened_db.transaction('read_news', 'readwrite');
      objectStore = transaction.objectStore('read_news');
      try {
        request = objectStore.add({
          title: title,
          link: link,
          last_seen_at: Math.floor(new Date().getTime() / 1000)
        });
      } catch (e$) {
        message = e$.message;
        GM_log("Error " + link + " , " + title + " , " + message);
      }
      return request.onerror = function(){
        var transaction, objectStore, index, get_request;
        transaction = opened_db.transaction('read_news', 'readwrite');
        objectStore = transaction.objectStore('read_news');
        index = objectStore.index('link');
        get_request = index.get(link);
        return get_request.onsuccess = function(){
          var put_request;
          return put_request = objectStore.put({
            id: get_request.result.id,
            title: title,
            last_seen_at: Math.floor(new Date().getTime() / 1000)
          });
        };
      };
    });
  };
  check_report = function(title, url, cb){
    if (!url) {
      return;
    }
    return get_newshelper_db(function(opened_db){
      var transaction, objectStore, index, get_request;
      transaction = opened_db.transaction('report', 'readonly');
      objectStore = transaction.objectStore('report');
      index = objectStore.index('news_link');
      get_request = index.get(url);
      return get_request.onsuccess = function(){
        if (get_request.result && !parseInt(get_request.result.deleted_at, 10)) {
          return cb(get_request.result);
        }
      };
    });
  };
  sync_report_data();
  pageMod.PageMod({
    include: ['https://www.facebook.com/*', 'http://www.facebook.com/*'],
    contentScriptWhen: 'ready',
    contentStyleFile: [self.data.url('content_style.css')],
    contentScriptFile: [self.data.url('jquery-2.0.3.min.js'), self.data.url('facebook.js')],
    onAttach: function(worker){
      worker.port.on('logBrowsedLink', function(d){
        return log_browsed_link(d.linkHref, d.titleText);
      });
      return worker.port.on('checkReport', function(d){
        return check_report(d.titleText, d.linkHref, function(res){
          res.linkHref = d.linkHref;
          return worker.port.emit('checkReportResult', res);
        });
      });
    }
  });
  pageMod.PageMod({
    include: ['https://plus.google.com/*', 'http://plus.google.com/*'],
    contentScriptWhen: 'ready',
    contentStyleFile: [self.data.url('content_style.css')],
    contentScriptFile: [self.data.url('jquery-2.0.3.min.js'), self.data.url('googleplus.js')],
    onAttach: function(worker){
      worker.port.on('logBrowsedLink', function(d){
        return log_browsed_link(d.linkHref, d.titleText);
      });
      return worker.port.on('checkReport', function(d){
        return check_report(d.titleText, d.linkHref, function(res){
          res.linkHref = d.linkHref;
          return worker.port.emit('checkReportResult', res);
        });
      });
    }
  });
  tabs.on('ready', function(tab){
    return check_report(tab.title, tab.url, function(res){
      tab.attach({
        contentScript: 'document.body.style.border = "5px solid red";'
      });
      return notifications.notify({
        title: "注意！您可能是問題新聞的受害者",
        text: res.report_title,
        data: res.report_link,
        onClick: function(data){
          return tabs.open(data);
        }
      });
    });
  });
}).call(this);
