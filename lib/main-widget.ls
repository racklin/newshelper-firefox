# add panel widget
newshelper-widget-icon = self.data.url \icon.png
newshelper-widget-page-icon = self.data.url \page.png
last-active-tab-result = {}

newshelper-panel = Panel do
  width: 360
  height: 120,
  contentURL: self.data.url \panel.html
  contentScriptFile: [self.data.url(\jquery-2.0.3.min.js), self.data.url(\panel.js)]

newshelper-panel.port.on \resizeHeight, (height) ->
  newshelper-panel.height = height+30;


newshelper-widget = ActionButton do
  id: \newshelper-icon
  label: "新聞小幫手"
  icon: do
    '64': newshelper-widget-icon
  panel: newshelper-panel
  on-click: ->
    newshelper-panel.port.emit \refreshContent, last-active-tab-result


# register tab ready and check url
# Listen for tab content loads.
tabs.on 'ready', (tab) ->
  #console.log "Tab ready #{tab.url}"
  newshelper-widget.contentURL = newshelper-widget-icon
  last-active-tab-result := {news_link: tab.url, news_title: tab.title}
  (res) <- check_report tab.title, tab.url
  return unless res
  last-active-tab-result <<< res
  newshelper-widget.contentURL = newshelper-widget-page-icon
  if prefs[\highlight_website]
    tab.attach do
      contentScript: 'document.body.style.border = "5px solid red";'

  showNotification "注意！您可能是問題新聞的受害者", res.report_title, res.report_link


tabs.on \activate, (tab) ->
  #console.log "Tab activate #{tab.url}"
  newshelper-widget.contentURL = newshelper-widget-icon
  last-active-tab-result := {news_link: tab.url, news_title: tab.title}
  (res) <- check_report tab.title, tab.url
  return unless res
  last-active-tab-result <<< res
  newshelper-widget.contentURL = newshelper-widget-page-icon

