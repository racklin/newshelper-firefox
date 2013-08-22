# add panel widget
newshelper-widget-icon = self.data.url \icon.png
newshelper-widget-page-icon = self.data.url \page.png
last-active-tab-result = {}

newshelper-panel = Panel do
  width: 360
  height: 120,
  contentURL: self.data.url \panel.html
  contentScriptFile: [self.data.url(\jquery-2.0.3.min.js), self.data.url(\panel.js)]

newshelper-widget = Widget do
  id: \newshelper-icon
  label: "新聞小幫手"
  contentURL: newshelper-widget-icon
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
  last-active-tab-result <<< res
  newshelper-widget.contentURL = newshelper-widget-page-icon
  tab.attach do
    contentScript: 'document.body.style.border = "5px solid red";'

  notifications.notify do
    title: "注意！您可能是問題新聞的受害者"
    text: res.report_title
    data: res.report_link,
    onClick: (data) ->
      tabs.open data

tabs.on \activate, (tab) ->
  #console.log "Tab activate #{tab.url}"
  newshelper-widget.contentURL = newshelper-widget-icon
  last-active-tab-result := {news_link: tab.url, news_title: tab.title}
  (res) <- check_report tab.title, tab.url
  last-active-tab-result <<< res
  newshelper-widget.contentURL = newshelper-widget-page-icon

