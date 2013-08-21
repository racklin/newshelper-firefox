let $ = jQuery
  $pane-page = $ \#newshelper-panel-page
  $pane-report = $ \#newshelper-panel-report

  # page is ok
  self.port.on \refreshContent, (data) ->

    if data?.report_link?
      $pane-report.hide!

      $ \#newshelper-panel-page-link .attr href: data.report_link
      $ \#newshelper-panel-page-link .text data.report_title

      $pane-page.show!

    else
      $pane-page.hide!

      url = "http://newshelper.g0v.tw"
      url += "?news_link=" + encodeURIComponent(data.news_link) + "&news_title= " + encodeURIComponent(data.news_title)  if data.news_link? and data.news_title?

      $ \#newshelper-panel-report-link .attr href: url

      $pane-report.show!

