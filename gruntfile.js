/*global module:false*/
module.exports = function (grunt) {
  "use strict";

  var concatName = 'dist/<%= pkg.name %>-<%= pkg.version %>.js';

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: {
      cleanBuild: ['dist'],
      postBuild: {
        src: [
          concatName,
          concatName + '.map'
        ]
      }
    },
    concat_sourcemap: {
      options: {
      },
      main: {
        src: ['dist/<%= pkg.name %>_src/intro.js', 'dist/<%= pkg.name %>_src/core.js', 'dist/<%= pkg.name %>_src/outro.js'],
        dest: concatName
      }
    },
    uglify: {
      options: {
        preserveComments: 'some'
      },
      main: {
        options: {
          sourceMapIn: 'dist/<%= pkg.name %>-<%= pkg.version %>.js.map',
          sourceMap: 'dist/<%= pkg.name %>-<%= pkg.version %>.min.js.map'
        },
        src: ['<%= concat_sourcemap.main.dest %>'],
        dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.min.js'
      }
    },
    'regex-replace': {
      // concat_sourcemap doesn't seem to supports banners, so banner is in intro.js,
      // search/replace vars
      banner: {
        src: 'dist/<%= pkg.name %>_src/intro.js',
        actions: [
          {
            search: '%pkg.name%',
            replace: '<%= pkg.name %>',
            flags: 'g'
          },
          {
            search: '%pkg.version%',
            replace: '<%= pkg.version %>',
            flags: 'g'
          },
          {
            search: '%build_date%',
            replace: '<%= grunt.template.today("yyyy-mm-dd") %>',
            flags: 'g'
          },
          {
            search: '%copyright_date%',
            replace: '<%= grunt.template.today("yyyy") %>',
            flags: 'g'
          },
          {
            search: '%author%',
            replace: '<%= pkg.author.name %>',
            flags: 'g'
          },
          {
            search: '%licenses%',
            replace: '<%= _.pluck(pkg.licenses, "type").join(", ") %>',
            flags: 'g'
          },
          {
            search: '%homepage%',
            replace: '<%= pkg.homepage %>',
            flags: 'g'
          }
        ]
      },
      postMin: {
        src: ['dist/<%= pkg.name %>-<%= pkg.version %>.min.js', 'dist/*.map'],
        actions: [
          {
            search: 'dist/',
            replace: '',
            flags: 'g'
          },
          { // right now Chrome seems to only support the old //@ syntax
            search: '//# sourceMappingURL=',
            replace: '//@ sourceMappingURL=',
            flags: 'g'
          }
        ]
      },
      test: {
        src: ['dist/test/tests.html'],
        actions: [
          {
            search: '../src/core.js',
            replace: '../<%= pkg.name %>-<%= pkg.version %>.min.js',
          }
        ]
      }
    },
    copy: {
      main: {
        expand: true,
        cwd: 'src/',
        src: ['*.js'],
        dest: 'dist/<%= pkg.name %>_src/',
        filter: 'isFile'
      },
      test: {
        expand: true,
        cwd: 'test/',
        src: ['**/*.js', '**/*.html', '**/*.css'],
        dest: 'dist/test/',
        filter: 'isFile'
      }
    },
    qunit: {
      main: ['test/**/*.html']
    },
    compress: {
      options: {
        mode: 'gzip'
      },
      main: {
        files: [
          {
            src: "dist/<%= pkg.name %>-<%= pkg.version %>.min.js",
            dest: "dist/<%= pkg.name %>-<%= pkg.version %>.min.js.gz"
          }
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-concat-sourcemap');
  grunt.loadNpmTasks('grunt-regex-replace');

  grunt.registerTask('default', ['clean:cleanBuild', 'qunit', 'copy', 'regex-replace:banner', 'regex-replace:test', 'concat_sourcemap', 'uglify', 'regex-replace:postMin', 'compress', 'clean:postBuild']);
  grunt.registerTask('source', ['clean:cleanBuild', 'qunit', 'copy', 'regex-replace:banner', 'concat_sourcemap']);
  grunt.registerTask('cleanup', ['clean:cleanBuild']);
};
