module.exports = (grunt) ->

  grunt.task.loadNpmTasks \grunt-lsc
  grunt.task.loadNpmTasks \grunt-contrib-uglify
  grunt.task.loadNpmTasks \grunt-contrib-concat
  grunt.task.loadNpmTasks \grunt-shell

  grunt.initConfig (

    shell:
      run:
        options: {+stdout, +stderr}
        command: 'cfx run'

      xpi:
        options: {+stdout, +stderr}
        command: 'cfx xpi'


    lsc:
      main:
        files:
          \lib/main.js : <[ lib/main.ls ]>
      data:
        files:
          \data/facebook.js : <[ data/facebook.ls ]>
          \data/googleplus.js : <[ data/googleplus.ls ]>
          \data/panel.js : <[ data/panel.ls ]>


    concat:
      user:
        files:
          \user.js : <[ meta.js user.js ]>
          \user.min.js : <[ meta.js user.min.js ]>


    uglify:
      user:
        options:
          preserveComments: \some
        files:
          \user.min.js : <[ user.js ]>

  )
  grunt.registerTask \default, <[ lsc ]>
  grunt.registerTask \xpi, <[ default shell:xpi ]>
  grunt.registerTask \run, <[ default shell:run ]>
