module.exports = function(grunt) {

  grunt.initConfig({
    jsdoc : {
      dist : {
        src: [
          './*.js',
          'README.md'
        ],
        jsdoc: './node_modules/.bin/jsdoc',
        options: {
          destination: 'docs',
          configure: './config/conf.json',
          template: './node_modules/jsdoc-oblivion/template'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-jsdoc');

};
