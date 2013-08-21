(function(){
  (function($){
    var $panePage, $paneReport;
    $panePage = $('#newshelper-panel-page');
    $paneReport = $('#newshelper-panel-report');
    self.port.on('refreshContent', function(data){
      var url;
      if ((data != null ? data.report_link : void 8) != null) {
        $paneReport.hide();
        $('#newshelper-panel-page-link').attr({
          href: data.report_link
        });
        $('#newshelper-panel-page-link').text(data.report_title);
        return $panePage.show();
      } else {
        $panePage.hide();
        url = "http://newshelper.g0v.tw";
        if (data.news_link != null && data.news_title != null) {
          url += "?news_link=" + encodeURIComponent(data.news_link) + "&news_title= " + encodeURIComponent(data.news_title);
        }
        $('#newshelper-panel-report-link').attr({
          href: url
        });
        return $paneReport.show();
      }
    });
  }.call(this, jQuery));
}).call(this);
