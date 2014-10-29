require! <[ self page-mod sdk/notifications sdk/tabs ]>
require! request.Request
{ indexedDB } = require \indexed-db
{ Widget } = require \sdk/widget
{ Panel } = require \sdk/panel
{ setTimeout, clearTimeout} = require \timers
{ prefs } = require \sdk/simple-prefs
URLNormalizer = require \./url-normalizer.js

# init URLNormalizer Map
URLNormalizer.setCSVMap self.data.load \map.csv
