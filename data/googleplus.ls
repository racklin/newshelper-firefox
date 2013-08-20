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
    """ + $("<span></span>").append($("<a></a>").attr(
      href: options.link
      target: "_blank"
    ).text(options.title)).html() + "</span></div>"


  censorGooglePlus = (baseNode) ->
    # add warning message to a GooglePlus post if necessary
    censorGooglePlusNode = (containerNode, titleText, linkHref) ->
      containerNode = $(containerNode)
      if containerNode.hasClass(className)
        return
      else
        containerNode.addClass className

      # add to cache
      addContainerNodes titleText, linkHref, containerNode

      self.port.emit \logBrowsedLink, {linkHref, titleText}
      self.port.emit \checkReport, {linkHref, titleText}


    # my timeline
    $(baseNode).find(".ZpzDcd").each (idx, uiStreamAttachment) ->
      uiStreamAttachment = $(uiStreamAttachment)
      unless uiStreamAttachment.hasClass(className)
        titleText = uiStreamAttachment.find("a.YF").text()
        linkHref = uiStreamAttachment.find("a.YF").attr("href")
        #console.log linkHref
        censorGooglePlusNode uiStreamAttachment, titleText, linkHref


  buildActionBar = (options) ->
    url = "http://newshelper.g0v.tw"
    url += "?news_link=" + encodeURIComponent(options.link) + "&news_title= " + encodeURIComponent(options.title)  if "undefined" isnt typeof (options.title) and "undefined" isnt typeof (options.link)
    "<a href=\"" + url + "\" target=\"_blank\">回報給新聞小幫手</a>"

  registerObserver = ->
    MutationObserver = window.MutationObserver or window.WebKitMutationObserver
    mutationObserverConfig =
      target: document.getElementsByTagName(\body)[0]
      config:
        attributes: true
        childList: true
        characterData: true

    throttle = do ->
      var timer_
      (fn, wait) ->
        if timer_ then clearTimeout timer_
        timer_ := setTimeout fn, wait

    mutationObserver = new MutationObserver (mutations) ->
      # So far, the value of mutation.target is always document.body.
      # Unless we want to do more fine-granted control, it is ok to pass document.body for now.
      throttle ->
        censorGooglePlus document.body
      , 1000

    mutationObserver.observe mutationObserverConfig.target, mutationObserverConfig.config

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

    censorGooglePlus document.body

    # deal with changed DOMs (i.e. AJAX-loaded content)
    registerObserver()

