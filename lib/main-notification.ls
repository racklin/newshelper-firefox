showNotification = (title=\新聞小幫手提醒您, text, link) ->
  return unless prefs[\display_notification]

  notifications.notify do
    title: title
    text: text
    data: link
    onClick: (data) ->
      tabs.open data

