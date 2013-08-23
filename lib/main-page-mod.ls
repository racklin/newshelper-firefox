# register facebook newshelper check
pageMod.PageMod do
  include: <[ https://www.facebook.com/* http://www.facebook.com/* ]>
  contentScriptWhen: 'ready'
  contentStyleFile: [self.data.url \content_style.css]
  contentScriptFile: [self.data.url(\jquery-2.0.3.min.js), self.data.url(\facebook.js)]
  onAttach: (worker) ->
    worker.port.on \logBrowsedLink, (d) ->
      log_browsed_link d.linkHref, d.titleText

    worker.port.on \checkReport, (d) ->
      check_report d.titleText, d.linkHref, (res) ->
        res.linkHref = d.linkHref
        worker.port.emit \checkReportResult, res

# register google plus newshelper check
pageMod.PageMod do
  include: <[ https://plus.google.com/* http://plus.google.com/* ]>
  contentScriptWhen: 'ready'
  contentStyleFile: [self.data.url \content_style.css]
  contentScriptFile: [self.data.url(\jquery-2.0.3.min.js), self.data.url(\googleplus.js)]
  onAttach: (worker) ->
    worker.port.on \logBrowsedLink, (d) ->
      log_browsed_link d.linkHref, d.titleText

    worker.port.on \checkReport, (d) ->
      check_report d.titleText, d.linkHref, (res) ->
        res.linkHref = d.linkHref
        worker.port.emit \checkReportResult, res

