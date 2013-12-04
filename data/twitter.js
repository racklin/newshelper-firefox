(function(){
  (function($){
    var containerNodes, className, classNameAdded, addContainerNodes, buildWarningMessage, censorTwitter, buildActionBar, config, registerObserver;
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
      return "<div class=\"newshelper-warning-googleplus\">\n  <div class=\"arrow-up\"></div>\n  注意！您可能是<b>問題新聞</b>的受害者\n  <span class=\"newshelper-description googleplus\">" + $('<span></span>').append($('<a></a>').attr({
        href: options.link,
        target: '_blank'
      }).text(options.title)).html() + '</span></div>';
    };
    censorTwitter = function(baseNode){
      var censorTwitterNode;
      censorTwitterNode = function(containerNode, titleText, linkHref){
        if (containerNode.hasClass(className)) {
          return;
        } else {
          containerNode.addClass(className);
        }
        if (!linkHref) {
          return;
        }
        containerNode.find('ul.tweet-actions').each(function(idx, linkContainer){
          return $(linkContainer).prepend($('<li></li>').html(buildActionBar({
            title: titleText,
            link: linkHref
          })));
        });
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
      return $(baseNode).find('li').not("." + className + ",.original-tweet-container").each(function(idx, uiStreamAttachment){
        var titleText, linkHref;
        uiStreamAttachment = $(uiStreamAttachment);
        titleText = uiStreamAttachment.find('a.twitter-timeline-link').attr('title');
        linkHref = uiStreamAttachment.find('a.twitter-timeline-link').attr('data-expanded-url');
        return censorTwitterNode(uiStreamAttachment, titleText, linkHref);
      });
    };
    buildActionBar = function(options){
      var url;
      url = "http://newshelper.g0v.tw/";
      if ("undefined" !== typeof options.title && "undefined" !== typeof options.link) {
        url += "?news_link=" + encodeURIComponent(options.link) + "&news_title= " + encodeURIComponent(options.title);
      }
      return "<a href=\"" + url + "\" target=\"_blank\">回報給新聞小幫手</a>";
    };
    config = {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true
    };
    registerObserver = function(){
      var MutationObserver, throttle, mutationObserver;
      MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
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
        var hasNewNode;
        hasNewNode = false;
        mutations.forEach(function(mutation, idx){
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            return hasNewNode = true;
          }
        });
        if (hasNewNode) {
          return throttle(function(){
            var target;
            target = document.getElementById('stream-items-id');
            return censorTwitter(target);
          }, 1000);
        }
      });
      return mutationObserver.observe(document.body, config);
    };
    (function(){
      var timer_;
      self.port.on('checkReportResult', function(report){
        var ref$, ref1$;
        return (ref$ = containerNodes[report.linkHref]) != null ? (ref1$ = ref$.nodes) != null ? ref1$.forEach(function(containerNode){
          if (containerNode.hasClass(classNameAdded)) {
            return false;
          }
          containerNode.addClass(classNameAdded);
          return containerNode.find('p.tweet-text').append(buildWarningMessage({
            title: report.report_title,
            link: report.report_link
          }));
        }) : void 8 : void 8;
      });
      return timer_ = setInterval(function(){
        var target;
        target = document.getElementById('stream-items-id');
        if (target) {
          clearInterval(timer_);
          censorTwitter(target);
          return registerObserver();
        }
      }, 1000);
    })();
  }.call(this, jQuery));
}).call(this);
