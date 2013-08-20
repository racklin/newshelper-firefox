(function(){
  (function($){
    var containerNodes, className, classNameAdded, addContainerNodes, buildWarningMessage, censorGooglePlus, buildActionBar, registerObserver;
    containerNodes = {};
    className = 'newshelper-checked';
    classNameAdded = 'newshelper-added';
    addContainerNodes = function(titleText, linkHref, containerNode){
      if (containerNodes[linkHref] != null) {
        return containerNodes[linkHref].nodes.push(containerNode);
      } else {
        return containerNodes[linkHref] = {
          nodes: [containerNode],
          linkHref: linkHref,
          titleText: titleText
        };
      }
    };
    buildWarningMessage = function(options){
      return "<div class=\"newshelper-warning-googleplus\">\n  <div class=\"arrow-up\"></div>\n  注意！您可能是<b>問題新聞</b>的受害者\n  <span class=\"newshelper-description googleplus\">" + $("<span></span>").append($("<a></a>").attr({
        href: options.link,
        target: "_blank"
      }).text(options.title)).html() + "</span></div>";
    };
    censorGooglePlus = function(baseNode){
      var censorGooglePlusNode;
      censorGooglePlusNode = function(containerNode, titleText, linkHref){
        containerNode = $(containerNode);
        if (containerNode.hasClass(className)) {
          return;
        } else {
          containerNode.addClass(className);
        }
        addContainerNodes(titleText, linkHref, containerNode);
        self.port.emit('logBrowsedLink', {
          linkHref: linkHref,
          titleText: titleText
        });
        return self.port.emit('checkReport', {
          linkHref: linkHref,
          titleText: titleText
        });
      };
      return $(baseNode).find(".ZpzDcd").each(function(idx, uiStreamAttachment){
        var titleText, linkHref;
        uiStreamAttachment = $(uiStreamAttachment);
        if (!uiStreamAttachment.hasClass(className)) {
          titleText = uiStreamAttachment.find("a.YF").text();
          linkHref = uiStreamAttachment.find("a.YF").attr("href");
          return censorGooglePlusNode(uiStreamAttachment, titleText, linkHref);
        }
      });
    };
    buildActionBar = function(options){
      var url;
      url = "http://newshelper.g0v.tw";
      if ("undefined" !== typeof options.title && "undefined" !== typeof options.link) {
        url += "?news_link=" + encodeURIComponent(options.link) + "&news_title= " + encodeURIComponent(options.title);
      }
      return "<a href=\"" + url + "\" target=\"_blank\">回報給新聞小幫手</a>";
    };
    registerObserver = function(){
      var MutationObserver, mutationObserverConfig, throttle, mutationObserver;
      MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
      mutationObserverConfig = {
        target: document.getElementsByTagName('body')[0],
        config: {
          attributes: true,
          childList: true,
          characterData: true
        }
      };
      throttle = function(){
        var timer_;
        return function(fn, wait){
          if (timer_) {
            clearTimeout(timer_);
          }
          return timer_ = setTimeout(fn, wait);
        };
      }();
      mutationObserver = new MutationObserver(function(mutations){
        return throttle(function(){
          return censorGooglePlus(document.body);
        }, 1000);
      });
      return mutationObserver.observe(mutationObserverConfig.target, mutationObserverConfig.config);
    };
    (function(){
      self.port.on('checkReportResult', function(report){
        var ref$, ref1$;
        return (ref$ = containerNodes[report.linkHref]) != null ? (ref1$ = ref$.nodes) != null ? ref1$.forEach(function(containerNode){
          if (containerNode.hasClass(classNameAdded)) {
            return false;
          }
          containerNode.addClass(classNameAdded);
          return containerNode.append(buildWarningMessage({
            title: report.report_title,
            link: report.report_link
          }));
        }) : void 8 : void 8;
      });
      censorGooglePlus(document.body);
      return registerObserver();
    })();
  }.call(this, jQuery));
}).call(this);
