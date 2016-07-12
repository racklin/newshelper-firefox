require! <[ sdk/self sdk/page-mod sdk/notifications sdk/tabs ]>
{ Request } = require \sdk/request
{ indexedDB } = require \sdk/indexed-db
{ ActionButton } = require \sdk/ui
{ Panel } = require \sdk/panel
{ setTimeout, clearTimeout} = require \sdk/timers
{ prefs } = require \sdk/simple-prefs
URLNormalizer = require \./url-normalizer.js

# init URLNormalizer Map
URLNormalizer.setCSVMap self.data.load \map.csv
