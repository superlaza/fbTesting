/**
 * Created by Bird on 7/12/2014.
 */
module.exports = function(grunt) {

    // load all grunt tasks from the package.json that matches the `grunt-*` pattern
    require('load-grunt-tasks')(grunt);
    var config = grunt.file.readJSON('grunt-config.json');
    //Functions used to run background

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        exec: {
            startRedis: {
                options:{
                    cwd: __dirname + '\\redis-2.8\\bin\\release\\redis-2.8.12'
                },
                cmd: 'redis-server.exe'
            },
            stopRedis: {
                cmd: 'taskkill /F /IM redis-server.exe'
            }
        },
        concurrent: {
            dev: {
                tasks: [ 'exec:startRedis', 'nodemon',  'watch'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },
        nodemon: {
            dev: {
                script: 'app.js',
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
                                //currently, my config opens the file in canary. customize for yourself.
                                //there is a way to refresh instead of creating new tab, but it uses external tool
                                //didn't have enough time
                                require('open')('http://localhost:8000', config['canary']);
                            }, 1);
                        });

                        // refreshes browser when server reboots
                        nodemon.on('restart', function () {
                            // Delay before server listens on port
                            setTimeout(function() {
                                require('fs').writeFileSync('.rebooted', 'rebooted');
                            }, 1);
                        });
                    },
                    env: {
                        PORT: '8000'
                    },
                    cwd: __dirname, //current working directory
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
                    //livereload starts a server, browser extension found below listens on default port 35729 (needs to be default)
                    //https://github.com/gruntjs/grunt-contrib-watch#using-live-reload-with-the-browser-extension
                    //the other alternative is script injection during development using grunt-inject below
                    //https://github.com/ChrisWren/grunt-inject
                    livereload: true,
                    spawn:false
                }
            }
        }
    });

    grunt.registerTask('default', ['concurrent:dev']);
    grunt.registerTask('start', 'Start the redis server', ['exec:startRedis']);
    grunt.registerTask('stop', 'Stop the redis server', ['exec:stopRedis']);
};
