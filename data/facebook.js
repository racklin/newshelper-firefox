(function(){
  (function($){
    var containerNodes, className, addContainerNodes, buildWarningMessage, censorFacebook, buildActionBar, registerObserver;
    containerNodes = {};
    className = 'newshelper-checked';
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
      return "<div class=\"newshelper-warning-facebook\">\n  <div class=\"arrow-up\"></div>\n  注意！您可能是<b>問題新聞</b>的受害者\n  <span class=\"newshelper-description\">" + $("<span></span>").append($("<a></a>").attr({
        href: options.link,
        target: "_blank"
      }).text(options.title)).html() + "</span></div>";
    };
    censorFacebook = function(baseNode){
      var censorFacebookNode;
      censorFacebookNode = function(containerNode, titleText, linkHref){
        var matches, addedAction;
        matches = ("" + linkHref).match("^http://www.facebook.com/l.php\\?u=([^&]*)");
        if (matches) {
          linkHref = decodeURIComponent(matches[1]);
        }
        containerNode = $(containerNode);
        if (containerNode.hasClass(className)) {
          return;
        }
        addedAction = false;
        containerNode.parent("div[role=article]").find(".uiStreamActionFooter").each(function(idx, uiStreamSource){
          var addedAction;
          $(uiStreamSource).find("li:first").append("· " + buildActionBar({
            title: titleText,
            link: linkHref
          }));
          return addedAction = true;
        });
        if (!addedAction) {
          containerNode.parent("div[role=article]").find(".uiStreamSource").each(function(idx, uiStreamSource){
            $($("<span></span>").html(buildActionBar({
              title: titleText,
              link: linkHref
            }))).insertBefore(uiStreamSource);
            if (idx !== 0) {
              return console.error(idx + titleText);
            }
          });
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
      $(baseNode).find(".uiStreamAttachments").each(function(idx, uiStreamAttachment){
        var titleText, linkHref;
        uiStreamAttachment = $(uiStreamAttachment);
        if (!uiStreamAttachment.hasClass("newshelper-checked")) {
          titleText = uiStreamAttachment.find(".uiAttachmentTitle").text();
          linkHref = uiStreamAttachment.find("a").attr("href");
          return censorFacebookNode(uiStreamAttachment, titleText, linkHref);
        }
      });
      $(baseNode).find(".shareUnit").each(function(idx, shareUnit){
        var titleText, linkHref;
        shareUnit = $(shareUnit);
        if (!shareUnit.hasClass("newshelper-checked")) {
          titleText = shareUnit.find(".fwb").text();
          linkHref = shareUnit.find("a").attr("href");
          return censorFacebookNode(shareUnit, titleText, linkHref);
        }
      });
      return $(baseNode).find('._6kv').not('newshelper-checked').each(function(idx, userContent){
        var titleText, linkHref;
        userContent = $(userContent);
        titleText = userContent.find('.mbs').text();
        linkHref = userContent.find('a').attr('href');
        return censorFacebookNode(userContent, titleText, linkHref);
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
          return censorFacebook(document.body);
        }, 1000);
      });
      return mutationObserver.observe(mutationObserverConfig.target, mutationObserverConfig.config);
    };
    (function(){
      self.port.on('checkReportResult', function(report){
        var ref$, ref1$;
        return (ref$ = containerNodes[report.linkHref]) != null ? (ref1$ = ref$.nodes) != null ? ref1$.forEach(function(containerNode){
          if (containerNode.hasClass(className)) {
            return false;
          }
          containerNode.addClass(className);
          return containerNode.append(buildWarningMessage({
            title: report.report_title,
            link: report.report_link
          }));
        }) : void 8 : void 8;
      });
      censorFacebook(document.body);
      return registerObserver();
    })();
  }.call(this, jQuery));
}).call(this);
