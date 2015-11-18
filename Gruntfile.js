module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            options: {
                jshintrc: 'jshintrc',
                ignores: ['public/dev/js/lib/'],
                force: true
            },
            build: {
                src: ['Gruntfile.js', 'test/**/*.js', 'app/**/*.js', 'config/**/*.js', 'public/dev/js/**/*.js']
            },
        },
        concat: {
            options: {
                separator: ';',
            },
            dist: {
                src: ['public/dev/js/**/*.js'],
                dest: 'public/prod/<%= pkg.name %>.js'
            },
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                files: [{
                    expand: true, // Enable dynamic expansion.
                    cwd: 'public/dev/', // Src matches are relative to this path.
                    src: ['**/*.js'], // Actual pattern(s) to match.
                    dest: 'public/prod/', // Destination path prefix.
                    ext: '.min.js', // Dest filepaths will have this extension.
                    extDot: 'first' // Extensions in filenames begin after the first dot
                }]
            }
        }
    });

    // Load the plugins that provides the tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');

    // Default task(s).
    grunt.registerTask('default', ['uglify', 'concat']);

};