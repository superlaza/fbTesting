/**
 * Created by Bird on 7/12/2014.
 */
module.exports = function(grunt) {

    // load all grunt tasks from the package.json that matches the `grunt-*` pattern
    require('load-grunt-tasks')(grunt);

    // Project configuration.
    grunt.initConfig({
        concurrent: {
            dev: {
                tasks: ['nodemon',  'watch'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },
        nodemon: {
            dev: {
                script: 'nodejs/app.js',
                options: {
                    nodeArgs: ['--debug'],
                    // omit this property if you aren't serving HTML files and
                    // don't want to open a browser tab on start
                    callback: function (nodemon) {
                        nodemon.on('log', function (event) {
                            console.log(event.colour);
                        });

                        // opens browser on initial server start
                        nodemon.on('config:update', function () {
                            // Delay before server listens on port
                            setTimeout(function() {
                                require('open')('http://localhost:8000');
                            }, 1000);
                        });

                        // refreshes browser when server reboots
                        nodemon.on('restart', function () {
                            // Delay before server listens on port
                            setTimeout(function() {
                                require('fs').writeFileSync('.rebooted', 'rebooted');
                            }, 1000);
                        });
                    },
                    ext: 'js,html,css',
                    ignore: [
                        'node_modules/**',
                        'doc/**',
                        'uploads/**'
                    ]
                }
            }
        },
        watch: {
            server: {
                files: ['.rebooted'],
                options: {
                    livereload: true
                }
            }
        }
    });

    grunt.registerTask('default', ['concurrent:dev'])
};