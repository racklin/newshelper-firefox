require! <[ self page-mod sdk/notifications sdk/tabs ]>
require! request.Request
{ indexedDB } = require \indexed-db
{ setTimeout, clearTimeout} = require \timers

opened_db = null

get_time_diff = (time) ->
  delta = Math.floor(new Date!getTime! / 1000) - time
  switch true
  | delta < 60 => "#delta 秒前"
  | delta < 60 * 60 => "#{Math.floor(delta / 60)} 分鐘前"
  | delta < 60 * 60 * 24 => "#{Math.floor(delta / 60 / 60)} 小時前"
  | _ => "#{Math.floor(delta / 60 / 60 / 24)} 天前"


get_newshelper_db = (cb) ->
  if opened_db? then return cb opened_db

  request = indexedDB.open(\newshelper, \6)
  request.onsuccess = (event) ->
    opened_db := request.result
    cb opened_db

  request.onerror = (event) ->
    console.log "IndexedDB error: #{event.target.errorCode}"

  request.onupgradeneeded = (event) ->
    try
      event.currentTarget.result.deleteObjectStore \read_news
    objectStore = event.currentTarget.result.createObjectStore \read_news, keyPath: \id, autoIncrement: true
    objectStore.createIndex \title, \title, unique: false
    objectStore.createIndex \link, \link, unique: true
    objectStore.createIndex \last_seen_at, \last_seen_at, unique: false

    try
      event.currentTarget.result.deleteObjectStore \report
    objectStore = event.currentTarget.result.createObjectStore \report, keyPath: \id
    objectStore.createIndex \news_title, \news_title, unique: false
    objectStore.createIndex \news_link, \news_link, unique: false
    objectStore.createIndex \updated_at, \updated_at, unique: false


check_recent_seen = (report) ->
  (opened_db) <- get_newshelper_db
  transaction = opened_db.transaction \read_news, \readonly
  objectStore = transaction.objectStore \read_news
  index = objectStore.index \link
  get_request = index.get report.news_link
  get_request.onsuccess = ->
    return  unless get_request.result

    # 如果已經被刪除了就跳過
    return if parseInt(get_request.result.deleted_at, 10)

    notifications.notify do
      title: \新聞小幫手提醒您
      text: "您於 #{get_time_diff(get_request.result.last_seen_at)} 看的新聞「#{get_request.result.title}」 被人回報有錯誤：#{report.report_title}"
      data: report.report_link
      onClick: (data) ->
        tabs.open data

get_recent_report = (cb) ->
  (opened_db) <- get_newshelper_db
  transaction = opened_db.transaction \report, \readonly
  objectStore = transaction.objectStore \report
  index = objectStore.index \updated_at
  request = index.openCursor null, \prev
  request.onsuccess = ->
    if request.result then cb request.result.value else cb null


# 跟遠端 API server 同步回報資料
sync_report_data = ->
  (opened_db) <- get_newshelper_db
  (report) <- get_recent_report
  cachedTime = if report?.updated_at? then parseInt report.updated_at else 0
  url = "http://newshelper.g0v.tw/index/data?time=#cachedTime"
  Request({
    url: url
    on-complete: (response) ->
      ret = response.json
      transaction = opened_db.transaction \report, \readwrite
      objectStore = transaction.objectStore \report
      if ret.data
        i = 0

        while i < ret.data.length
          # console.log "title #{ret.data[i].news_link}"
          objectStore.put ret.data[i]

          # 檢查最近天看過的內容是否有被加進去的
          check_recent_seen ret.data[i]
          i++

      # 每 10 分鐘去檢查一次是否有更新
      setTimeout sync_report_data, 600000
  }).get!


seen_link = {};
log_browsed_link = (link, title) ->
  return  unless link

  if seen_link[link] then return else seen_link[link] = true

  (opened_db) <- get_newshelper_db
  transaction = opened_db.transaction \read_news, \readwrite
  objectStore = transaction.objectStore \read_news
  try
    request = objectStore.add do
      title: title
      link: link
      last_seen_at: Math.floor(new Date!getTime! / 1000)

  catch {message}
    GM_log "Error #link , #title , #message"

  # link 重覆
  request.onerror = ->
    transaction = opened_db.transaction \read_news, \readwrite
    objectStore = transaction.objectStore \read_news
    index = objectStore.index \link
    get_request = index.get link
    get_request.onsuccess = ->

      unless get_request.result
        console.log "link= #link is not found in IndexedDB"
        return

      # update last_seen_at
      put_request = objectStore.put do
        id: get_request.result.id
        title: title
        last_seen_at: Math.floor(new Date!getTime! / 1000)


# 從 db 中判斷 title, url 是否是錯誤新聞，是的話執行 cb 並傳入資訊
check_report = (title, url, cb) ->
  return unless url
  (opened_db) <- get_newshelper_db
  transaction = opened_db.transaction \report, \readonly
  objectStore = transaction.objectStore \report
  index = objectStore.index \news_link
  get_request = index.get(url)
  get_request.onsuccess = ->
    # 如果有找到結果，並且沒有被刪除
    cb get_request.result if get_request.result and not parseInt(get_request.result.deleted_at, 10)


# start sync_report_data
sync_report_data!


# register facebook newshelper check
pageMod.PageMod do
  include: <[ https://www.facebook.com/* http://www.facebook.com/* ]>
  contentScriptWhen: 'ready'
  contentStyleFile: [self.data.url \content_style.css]
  contentScriptFile: [self.data.url(\jquery-2.0.3.min.js), self.data.url(\facebook.js)]
  onAttach: (worker) ->
    worker.port.on \logBrowsedLink, (d) ->
      log_browsed_link d.linkHref, d.titleText

    worker.port.on \checkReport, (d) ->
      check_report d.titleText, d.linkHref, (res) ->
        res.linkHref = d.linkHref
        worker.port.emit \checkReportResult, res

# register google plus newshelper check
pageMod.PageMod do
  include: <[ https://plus.google.com/* http://plus.google.com/* ]>
  contentScriptWhen: 'ready'
  contentStyleFile: [self.data.url \content_style.css]
  contentScriptFile: [self.data.url(\jquery-2.0.3.min.js), self.data.url(\googleplus.js)]
  onAttach: (worker) ->
    worker.port.on \logBrowsedLink, (d) ->
      log_browsed_link d.linkHref, d.titleText

    worker.port.on \checkReport, (d) ->
      check_report d.titleText, d.linkHref, (res) ->
        res.linkHref = d.linkHref
        worker.port.emit \checkReportResult, res

# register tab ready and check url
# Listen for tab content loads.
tabs.on 'ready', (tab) ->
  check_report tab.title, tab.url, (res) ->
    tab.attach do
      contentScript: 'document.body.style.border = "5px solid red";'

    notifications.notify do
      title: "注意！您可能是問題新聞的受害者"
      text: res.report_title
      data: res.report_link,
      onClick: (data) ->
        tabs.open data

