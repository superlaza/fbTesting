//modules used
var fs = require('fs');//file system
var http = require('http');//server
var url = require('url');
var path =require('path');
var mime = require('mime');
var qs = require('querystring');
var exec = require('child_process').spawn;
var formidable = require('formidable');//form handling
var util = require('util');
var socket = require('socket.io');//socket.io fast message relay
var events = require('events');//custom events firing
var express = require('express');

//handle transport of data
var dataTransport = function(){this.data = undefined};
//inherit props from EventEmitter
dataTransport.prototype = new events.EventEmitter;
var dt = new dataTransport();

var app = express();

//main route
app.get('/', function(req, res){
    fs.readFile('./index.html', function (err, html) {
        if (err) {
            console.log(err);
        }
        res.set('Content-Type', 'text/html');
        res.send(html);
    });
});

//any other request, find file and server
app.get('*', function(req, res){
    var uri = url.parse(req.url).pathname;
    fs.readFile('./'+uri, function(err, data){
        if (err){
            //file can't be found
            console.log('Error loading '+uri);
            res.send(404);
            return;
        }

        res.set('Content-Type', mime.lookup(uri));
        res.send(data);
    });
});

//post handling
//TODO: modify action in html to use custom router
app.post('/upload', function(req, res){
    console.log('we get to post');
    //TODO: ALL POSSIBLE STATE EVOLUTIONS SHOULD BE ACCOUNTED FOR
    // parse a file upload
    var form = new formidable.IncomingForm();

    //set params
    form.keepExtensions = true;

    //register listener on file reception event..
    //in order to change file path to one with file's original name.
    //default generates random name for storage
    form.on('fileBegin', function(name, file) {
        //save to current directory
        //need to specify file path at moment of file discovery
        //otherwise it will be ignored when the writestream is created
        file.path = './uploads/'+file.name;
    });

    //register this callback to progress event to display progress
    form.on('progress', function(bytesReceived, bytesExpected) {
        var percent_complete = (bytesReceived / bytesExpected) * 100;
        console.log(percent_complete.toFixed(2));
    });

    form.on('end', function(){
        var pythonChild = exec('python', ['python/userDataProc.py', './uploads/messages.htm']);

        pythonChild.stdout.on('data', function (data) {
            if (data.toString().indexOf('timeLine') != -1) {

                fs.readFile('./wordcount.json', 'utf8', function (err, json) {
                    if (err) {
                        console.log(err);
                    }

                    dt.data = JSON.parse(json);
                    console.log('dt.data has the json file')
                });
            }

            console.log('python out:  ' + data);
        });

        pythonChild.stderr.on('data', function (data) {
            console.log('python errout: ' + data);
        });

        pythonChild.on('close', function (code) {
            if (code != 0) {
                console.log('python closed with an error')
            }
        });
    });

    form.on('error', function(err){
        console.log("File upload error: "+err);
        res.send("File upload error: "+err, 500);
    });

    //think of writing response in form.on('end',....);
    form.parse(req, function(err, fields, files) {
        res.writeHead(200, {'content-type': 'text/plain'});
        res.write('received upload:\n\n');
        res.end(util.inspect({fields: fields, files: files}));
    });

    //read through the upload data after it's been loaded
    function readStream(req){
        var body = '';
        req.on('data', function (data) {
            body += data;
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB

            if (body.length > 1e6) {
                //In case of flood, ends connection with 101
                req.connection.destroy();
            }
        });
        //when the request POST has finished uploading, output file
        req.on('end', function () {
            //example of dumping to txt file
            var post = qs.parse(body);
            fs.writeFile("../uploads/stream.txt", post, function(err){
                if(err) {
                    console.log(err);
                } else {
                    console.log("The file was saved! Yay!");
                }
            });
            console.log(post);

        });
        req.on('error', function(e) {
            console.log('badness here because of: ' + e.message);
        });
    }
});

var port = 8000;
server = app.listen(port, console.log('Listening on port '+port+'...'));

var io = socket.listen(server);
var nsp = io.of('/data');//custom namespace

nsp.on('connection', function(socket){
    console.log('what the fuck');
});

nsp.on('connection', function(socket){
    console.log(nsp);
    socket.emit('server', dt.data);
    //console.log(dt.data);
    console.log('sent the json');
});

