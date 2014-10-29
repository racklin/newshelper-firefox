let $ = jQuery

  containerNodes = {}
  className = \newshelper-checked
  classNameAdded = \newshelper-added


  addContainerNodes = (titleText, linkHref, containerNode) ->
    if containerNodes[linkHref]?
      containerNodes[linkHref].nodes.push(containerNode)
    else
      containerNodes[linkHref] = {nodes: [containerNode], linkHref, titleText}


  buildWarningMessage = (options) ->
    """
    <div class="newshelper-warning-facebook">
      <div class="arrow-up"></div>
      注意！您可能是<b>問題新聞</b>的受害者
      <span class="newshelper-description">
    """ + $(\<span></span>).append($(\<a></a>).attr(
      href: options.link
      target: \_blank
    ).text(options.title)).html() + \</span></div>


  censorFacebook = (baseNode) ->
    # add warning message to a Facebook post if necessary
    censorFacebookNode = (containerNode, titleText, linkHref, rule) ->

      matches = ("" + linkHref).match("^http://www.facebook.com/l.php\\?u=([^&]*)")
      linkHref = decodeURIComponent(matches[1])  if matches
      # 處理 被加上 ?fb_action_ids=xxxxx 的情況
      matches = ('' + linkHref).match('(.*)[?&]fb_action_ids=.*');
      linkHref = matches[1] if matches

      if containerNode.hasClass(className)
        return
      else
        containerNode.addClass className

      # 先看看是不是 uiStreamActionFooter, 表示是同一個新聞有多人分享, 那只要最上面加上就好了
      addedAction = false
      containerNode.parent('div[role=article]').find(\.uiStreamActionFooter).each (idx, uiStreamSource) ->
        $(uiStreamSource).find(\li:first).append "· " + buildActionBar(
          title: titleText
          link: linkHref
          action: 1
        )
        addedAction = true

      # 再看看單一動態，要加在 .uiStreamSource
      unless addedAction
        containerNode.parent('div[role=article]').find(\.uiStreamSource).each (idx, uiStreamSource) ->
          $($(\<span></span>).html(buildActionBar(
            title: titleText
            link: linkHref
            action: 2
          ))).insertBefore uiStreamSource

          addedAction = true
          # should only have one uiStreamSource
          console.error idx + titleText  unless idx is 0

      # 再來有可能是有人說某個連結讚
      unless addedAction
        containerNode.parent(\div.storyInnerContent).find(\.uiStreamSource).each (idx, uiStreamSource) ->
          $($(\<span></span>).html(buildActionBar(
            title: titleText
            link: linkHref
            action: 3
          ) + ' · ')).insertBefore  uiStreamSource
          addedAction = true

      # 再來是個人頁面
      unless addedAction
        containerNode.parent('div[role="article"]').siblings(\.uiCommentContainer).find(\.UIActionLinks).each (idx, uiStreamSource) ->
          $(uiStreamSource).append(' · ').append(buildActionBar({title: titleText, link: linkHref, action: 4}))
          addedAction = true

      # 新版Timeline
      unless addedAction
        containerNode.parent(\._4q_).find(\._6p-).find(\._5ciy).find(\._6j_).each (idx, shareAction) ->
          #console.log shareAction
          $($('<a class="_5cix"></a>').html(buildActionBar(
            title: titleText
            link: linkHref
            action: 5
          ))).insertAfter  shareAction
          addedAction = true

      # new layout
      unless addedAction
        containerNode.parents('.UFICommentContentBlock').find('.UFICommentActions').each (idx, foo) ->
          $(foo).append(' · ', buildActionBar(title: titleText, link: linkHref, action: 6))
          addedAction = true

      unless addedAction
        # this check sould be after UFICommentContent
        containerNode.parents(\._5pax).find(\._5pcp).each (idx, foo) ->
          $(foo).append(' · ', buildActionBar(title: titleText, link: linkHref, action: 7))
          addedAction = true

      # 再來是single post
      unless addedAction
        containerNode.parent('div[role="article"]').find('.uiCommentContainer .UIActionLinks').each (idx, uiStreamSource) ->
          $(uiStreamSource).append(' · ').append(buildActionBar(title: titleText, link: linkHref, action: 8))
          addedAction = true

      unless addedAction
        containerNode.siblings!find(\.uiCommentContainer).find(\.UIActionLinks).each (idx, foo) ->
          $(foo).append(' · ', buildActionBar(title: titleText, link: linkHref, action: 9))
          addedAction = true

      unless addedAction
        containerNode.parents('.userContentWrapper').find('._5vsi div').each (idx, foo) ->
          $(foo).append(' · ', buildActionBar(title: titleText, link: linkHref, rule: rule, action: 10))
          addedAction = true

      # cached containerNode
      addContainerNodes titleText, linkHref, containerNode

      self.port.emit \logBrowsedLink, {linkHref, titleText}
      self.port.emit \checkReport, {linkHref, titleText}


    # my timeline
    $ baseNode .find \.uiStreamAttachments .not ".#className" .each (idx, uiStreamAttachment) ->
      uiStreamAttachment = $ uiStreamAttachment
      titleText = uiStreamAttachment.find \.uiAttachmentTitle .text!
      linkHref = uiStreamAttachment.find \a .attr \href
      censorFacebookNode uiStreamAttachment, titleText, linkHref, \rule1

    $ baseNode .find \._5rwo .not ".#className" .each (idx, uiStreamAttachment) ->
      uiStreamAttachment = $ uiStreamAttachment
      titleText = uiStreamAttachment.find \.fwb .text!
      linkHref = uiStreamAttachment.find \a .attr \href
      censorFacebookNode uiStreamAttachment, titleText, linkHref, \rule2

    # others' timeline, fan page
    $ baseNode .find \.shareUnit .not ".#className" .each (idx, shareUnit) ->
      shareUnit = $ shareUnit
      titleText = shareUnit.find ".fwb" .text!
      linkHref = shareUnit.find \a .attr \href
      censorFacebookNode shareUnit, titleText, linkHref, \rule4

    $ baseNode .find \._5rny .not ".#className" .each (idx, userContent) ->
      userContent = $ userContent
      titleText = userContent .find \.fwb .text!
      linkHref = userContent .find \a .attr \href
      censorFacebookNode userContent, titleText, linkHref, \rule5

    # post page (single post)
    $ baseNode .find \._6kv .not ".#className" .each (idx, userContent) ->
      userContent = $ userContent
      titleText = userContent .find \.mbs .text!
      linkHref = userContent .find \a .attr \href
      censorFacebookNode userContent, titleText, linkHref, \rule6

    # post page (single post) */
    $ baseNode .find \._6m3 .not ".#className" .each (idx, userContent) ->
      userContent = $ userContent
      titleText = userContent .find \a .text!
      linkHref = userContent .find \a .attr \href
      censorFacebookNode userContent.parents('._2r3x').find('._6m3').parent!,serContent, titleText, linkHref, \rule7


  buildActionBar = (options) ->
    url = "http://newshelper.g0v.tw/"
    url += "?news_link=" + encodeURIComponent(options.link) + "&news_title= " + encodeURIComponent(options.title)  if "undefined" isnt typeof (options.title) and "undefined" isnt typeof (options.link)
    "<a href=\"" + url + "\" target=\"_blank\">回報給新聞小幫手</a>"

  config = { +attributes, +childList, +characterData, +subtree }

  registerObserver = ->
    MutationObserver = window.MutationObserver or window.WebKitMutationObserver

    throttle = do ->
      var timer_
      (fn, wait) ->
        if timer_ then clearTimeout timer_
        timer_ := setTimeout fn, wait

    mutationObserver = new MutationObserver (mutations) ->
      hasNewNode = false
      mutations.forEach (mutation, idx) ->
        hasNewNode := true if mutation.type is \childList and mutation.addedNodes.length > 0

      if hasNewNode
        throttle ->
          target = document.getElementById \contentArea
          censorFacebook target
        , 1000

    mutationObserver.observe document.body, config


  excludedPaths = <[ ai.php generic.php ]>

  do ->
    # check callback
    self.port.on \checkReportResult , (report) ->
      containerNodes[report.linkHref]?.nodes?.forEach (containerNode) ->
        if containerNode.hasClass classNameAdded
          return false
        containerNode.addClass classNameAdded
        containerNode.append buildWarningMessage(
          title: report.report_title
          link: report.report_link
        )

    excluded = false
    excludedPaths.forEach (excludedPath,idx) ->
      excluded = true if window.location.pathname.indexOf(excludedPath) isnt -1

    return if excluded

    # The contentArea is filled via AJAX.
    # Only need to call censorFacebook() after contentArea is present
    timer_ = setInterval ->
      target = document.getElementById \contentArea ? document.getElementById \content
      if target
        clearInterval timer_
        censorFacebook target
        registerObserver!
    , 1000

