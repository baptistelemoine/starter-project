/*global module:false*/
module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-requirejs');

  // Project configuration.
  grunt.initConfig({
    requirejs: {
      production: {
        options: {
          baseUrl: "js/",
          mainConfigFile: "js/main.js",
          out: "dist/project-min.js",
          name:'main'
        }
      }
    }
  });

  //grunt.registerTask('default', 'requirejs');

};
