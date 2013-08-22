require! <[ self page-mod sdk/notifications sdk/tabs ]>
require! request.Request
{ indexedDB } = require \indexed-db
{ Widget } = require \sdk/widget
{ Panel } = require \sdk/panel
{ setTimeout, clearTimeout} = require \timers
{ prefs } = require \sdk/simple-prefs
