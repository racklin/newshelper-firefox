(function(){
  (function($){
    var containerNodes, className, classNameAdded, addContainerNodes, buildWarningMessage, censorFacebook, buildActionBar, config, registerObserver, excludedPaths;
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
      return "<div class=\"newshelper-warning-facebook\">\n  <div class=\"arrow-up\"></div>\n  注意！您可能是<b>問題新聞</b>的受害者\n  <span class=\"newshelper-description\">" + $('<span></span>').append($('<a></a>').attr({
        href: options.link,
        target: '_blank'
      }).text(options.title)).html() + '</span></div>';
    };
    censorFacebook = function(baseNode){
      var censorFacebookNode;
      censorFacebookNode = function(containerNode, titleText, linkHref){
        var matches, addedAction;
        matches = ("" + linkHref).match("^http://www.facebook.com/l.php\\?u=([^&]*)");
        if (matches) {
          linkHref = decodeURIComponent(matches[1]);
        }
        matches = ('' + linkHref).match('(.*)[?&]fb_action_ids=.*');
        if (matches) {
          linkHref = matches[1];
        }
        if (containerNode.hasClass(className)) {
          return;
        } else {
          containerNode.addClass(className);
        }
        addedAction = false;
        containerNode.parent('div[role=article]').find('.uiStreamActionFooter').each(function(idx, uiStreamSource){
          var addedAction;
          $(uiStreamSource).find('li:first').append("· " + buildActionBar({
            title: titleText,
            link: linkHref
          }));
          return addedAction = true;
        });
        if (!addedAction) {
          containerNode.parent('div[role=article]').find('.uiStreamSource').each(function(idx, uiStreamSource){
            var addedAction;
            $($('<span></span>').html(buildActionBar({
              title: titleText,
              link: linkHref
            }))).insertBefore(uiStreamSource);
            addedAction = true;
            if (idx !== 0) {
              return console.error(idx + titleText);
            }
          });
        }
        if (!addedAction) {
          containerNode.parent('div.storyInnerContent').find('.uiStreamSource').each(function(idx, uiStreamSource){
            var addedAction;
            $($('<span></span>').html(buildActionBar({
              title: titleText,
              link: linkHref
            }) + ' · ')).insertBefore(uiStreamSource);
            return addedAction = true;
          });
        }
        if (!addedAction) {
          containerNode.parent('div[role="article"]').siblings('.uiCommentContainer').find('.UIActionLinks').each(function(idx, uiStreamSource){
            var addedAction;
            $(uiStreamSource).append(' · ').append(buildActionBar({
              title: titleText,
              link: linkHref
            }));
            return addedAction = true;
          });
        }
        if (!addedAction) {
          containerNode.parent('._4q_').find('._6p-').find('._5ciy').find('._6j_').each(function(idx, shareAction){
            var addedAction;
            $($('<a class="_5cix"></a>').html(buildActionBar({
              title: titleText,
              link: linkHref
            }))).insertAfter(shareAction);
            return addedAction = true;
          });
        }
        if (!addedAction) {
          containerNode.parent().parent('.UFICommentContent').parent().find('.UFICommentActions').each(function(idx, foo){
            var addedAction;
            $(foo).append(' · ', buildActionBar({
              title: titleText,
              link: linkHref
            }));
            return addedAction = true;
          });
        }
        if (!addedAction) {
          containerNode.parents('._5pax').find('._5pcp').each(function(idx, foo){
            var addedAction;
            $(foo).append(' · ', buildActionBar({
              title: titleText,
              link: linkHref
            }));
            return addedAction = true;
          });
        }
        if (!addedAction) {
          containerNode.parent('div[role="article"]').find('.uiCommentContainer .UIActionLinks').each(function(idx, uiStreamSource){
            var addedAction;
            $(uiStreamSource).append(' · ').append(buildActionBar({
              title: titleText,
              link: linkHref
            }));
            return addedAction = true;
          });
        }
        if (!addedAction) {
          containerNode.siblings().find('.uiCommentContainer').find('.UIActionLinks').each(function(idx, foo){
            var addedAction;
            $(foo).append(' · ', buildActionBar({
              title: titleText,
              link: linkHref
            }));
            return addedAction = true;
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
      $(baseNode).find('.uiStreamAttachments').not("." + className).each(function(idx, uiStreamAttachment){
        var titleText, linkHref;
        uiStreamAttachment = $(uiStreamAttachment);
        titleText = uiStreamAttachment.find('.uiAttachmentTitle').text();
        linkHref = uiStreamAttachment.find('a').attr('href');
        return censorFacebookNode(uiStreamAttachment, titleText, linkHref);
      });
      $(baseNode).find('._5rwo').not("." + className).each(function(idx, uiStreamAttachment){
        var titleText, linkHref;
        uiStreamAttachment = $(uiStreamAttachment);
        titleText = uiStreamAttachment.find('.fwb').text();
        linkHref = uiStreamAttachment.find('a').attr('href');
        return censorFacebookNode(uiStreamAttachment, titleText, linkHref);
      });
      $(baseNode).find('.shareUnit').not("." + className).each(function(idx, shareUnit){
        var titleText, linkHref;
        shareUnit = $(shareUnit);
        titleText = shareUnit.find(".fwb").text();
        linkHref = shareUnit.find('a').attr('href');
        return censorFacebookNode(shareUnit, titleText, linkHref);
      });
      $(baseNode).find('._5rny').not("." + className).each(function(idx, userContent){
        var titleText, linkHref;
        userContent = $(userContent);
        titleText = userContent.find('.fwb').text();
        linkHref = userContent.find('a').attr('href');
        return censorFacebookNode(userContent, titleText, linkHref);
      });
      return $(baseNode).find('._6kv').not("." + className).each(function(idx, userContent){
        var titleText, linkHref;
        userContent = $(userContent);
        titleText = userContent.find('.mbs').text();
        linkHref = userContent.find('a').attr('href');
        return censorFacebookNode(userContent, titleText, linkHref);
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
            target = document.getElementById('contentArea');
            return censorFacebook(target);
          }, 1000);
        }
      });
      return mutationObserver.observe(document.body, config);
    };
    excludedPaths = ['ai.php', 'generic.php'];
    (function(){
      var excluded, timer_;
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
      excluded = false;
      excludedPaths.forEach(function(excludedPath, idx){
        var excluded;
        if (window.location.pathname.indexOf(excludedPath) !== -1) {
          return excluded = true;
        }
      });
      if (excluded) {
        return;
      }
      return timer_ = setInterval(function(){
        var target;
        target = document.getElementById('contentArea' != null
          ? 'contentArea'
          : document.getElementById('content'));
        if (target) {
          clearInterval(timer_);
          censorFacebook(target);
          return registerObserver();
        }
      }, 1000);
    })();
  }.call(this, jQuery));
}).call(this);
