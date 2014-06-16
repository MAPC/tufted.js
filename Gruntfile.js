module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            js: {
                files: ['lib/*.js'],
                tasks: ['browserify']
            }
        },
        browserify: {
          dist: {
            files: {
              'tufted.js': ['build.js']
            }
          }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.registerTask('default', ['watch']);
};

