'use strict';

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    // Configurable paths for the application
    var appConfig = {
        app: require('./bower.json').appPath || 'src',
        dist: 'dist'
    };

    // Define the configuration for all the tasks
    grunt.initConfig({
        // Project settings
        yeoman: appConfig,
        jsdoc: {
            dist: {
                src: ['<%= yeoman.app %>/scripts/tel.js','<%= yeoman.app %>/scripts/*/*.js'],
                options: {
                    destination: 'doc'
                }
            }
        },
        // Watches files for changes and runs tasks based on the changed files
        watch: {
            bower: {
                files: ['bower.json'],
                tasks: ['wiredep']
            },
            js: {
                files: ['<%= yeoman.app %>/scripts/{,*/}*.js'],
                tasks: ['newer:jshint:all'],
                options: {
                    livereload: '<%= connect.options.livereload %>'
                }
            },
            jsTest: {
                files: ['test/spec/{,*/}*.js'],
                tasks: ['newer:jshint:test', 'karma']
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= yeoman.app %>/{,*/}*.html',
                    '.tmp/styles/{,*/}*.css',
                    '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },
        // The actual grunt server settings
        connect: {
            options: {
                port: 9000,
                // Change this to '0.0.0.0' to access the server from outside.
                hostname: 'localhost',
                livereload: 35729
            },
            livereload: {
                options: {
                    open: true,
                    middleware: function (connect) {
                        return [
                            connect.static('.tmp'),
                            connect().use(
                                    '/bower_components',
                                    connect.static('./bower_components')
                                    ),
                            connect.static(appConfig.app)
                        ];
                    }
                }
            },
            test: {
                options: {
                    port: 9001,
                    middleware: function (connect) {
                        return [
                            connect.static('.tmp'),
                            connect.static('test'),
                            connect().use(
                                    '/bower_components',
                                    connect.static('./bower_components')
                                    ),
                            connect.static(appConfig.app)
                        ];
                    }
                }
            },
            dist: {
                options: {
                    open: true,
                    base: '<%= yeoman.dist %>'
                }
            }
        },
        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: {
                src: [
                    'Gruntfile.js',
                    '<%= yeoman.app %>/{,*/}*.js'
                ]
            },
            test: {
                options: {
                    jshintrc: 'test/.jshintrc'
                },
                src: ['test/spec/{,*/}*.js']
            }
        },
        // Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                        dot: true,
                        src: [
                            '.tmp',
                            '<%= yeoman.dist %>/{,*/}*',
                            '!<%= yeoman.dist %>/.git{,*/}*'
                        ]
                    }]
            },
            server: '.tmp'
        },
        uglify: {
            dist: {
                files: {
                    '<%= yeoman.dist %>/tel.min.js': [
                        '<%= yeoman.dist %>/tel.js'
                    ]
                }
            }
        },
        concat: {
            dist: {
                src: [
                    '<%= yeoman.app %>/scripts/tel.js',
                    '<%= yeoman.app %>/scripts/*/*.js'
                ],
                dest: '<%= yeoman.dist %>/tel.js'
            }
        },
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>/scripts',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        'metadatalite.js'
                    ]
                }]
            }
        },
        // ng-annotate tries to make the code safe for minification automatically
        // by using the Angular long form for dependency injection.
        ngAnnotate: {
            dist: {
                files: [{
                        expand: true,
                        src: ['<%= yeoman.dist %>/tel.js'],
                        dest: ''
                    }]
            }
        },
        // Test settings
        karma: {
            unit: {
                configFile: 'test/karma.conf.js',
                singleRun: true
            }
        }
    });



    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.registerTask('test', [
        'clean:server',
        //'concurrent:test',
        //'autoprefixer',
        'connect:test',
        'karma'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'concat',
        'ngAnnotate',
        'uglify',
        'copy'
    ]);

    grunt.registerTask('default', [
        'newer:jshint',
        'test',
        'jsdoc',
        'build'
    ]);
};
