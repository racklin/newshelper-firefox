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
    <div class="newshelper-warning-googleplus">
      <div class="arrow-up"></div>
      注意！您可能是<b>問題新聞</b>的受害者
      <span class="newshelper-description googleplus">
    """ + $(\<span></span>).append($(\<a></a>).attr(
      href: options.link
      target: \_blank
    ).text(options.title)).html() + \</span></div>


  censorGooglePlus = (baseNode) ->
    # add warning message to a GooglePlus post if necessary
    censorGooglePlusNode = (containerNode, titleText, linkHref) ->
      containerNode = $(containerNode)
      if containerNode.hasClass(className)
        return
      else
        containerNode.addClass className

      # add report to newshelper
      containerNode.find \.yF .each (idx, linkContainer) ->
          $ linkContainer .append buildActionBar {title: titleText, link: linkHref}

      # add to cache
      addContainerNodes titleText, linkHref, containerNode

      self.port.emit \logBrowsedLink, {linkHref, titleText}
      self.port.emit \checkReport, {linkHref, titleText}


    # my timeline
    $ baseNode .find \.ZpzDcd .not className .each (idx, uiStreamAttachment) ->
      uiStreamAttachment = $(uiStreamAttachment)
      titleText = uiStreamAttachment.find \a.YF .text!
      linkHref = uiStreamAttachment.find \a.YF .attr \href
      #console.log linkHref
      censorGooglePlusNode uiStreamAttachment, titleText, linkHref


  buildActionBar = (options) ->
    url = "http://newshelper.g0v.tw/"
    url += "?news_link=" + encodeURIComponent(options.link) + "&news_title= " + encodeURIComponent(options.title)  if "undefined" isnt typeof (options.title) and "undefined" isnt typeof (options.link)
    "<a href=\"" + url + "\" target=\"_blank\">回報給新聞小幫手</a>"


  target = document.getElementById \contentPane
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
          censorGooglePlus target
        , 1000

    mutationObserver.observe target, config


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

    # The contentPane is filled via AJAX.
    # Only need to call censorGooglePlus() after contentPane is present
    timer_ = setInterval ->
      target = document.getElementById \contentPane
      if target
        clearInterval timer_
        censorGooglePlus target
        registerObserver!
    , 1000

