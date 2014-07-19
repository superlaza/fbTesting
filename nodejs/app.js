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
var colors = require('colors');//pretty console output
var express = require('express');

//<editor-fold desc="Formidable Initialization and Event Registration">
//TODO: ALL POSSIBLE FORM STATE EVOLUTIONS SHOULD BE ACCOUNTED FOR
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
                    console.log(err.toString().red);
                }

                //pick our socket from the list of sockets connected under this namespace
                nsp.connected[sockets['dataSocket']].emit('server', JSON.parse(json));
                console.log('sent data to frontend....')
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

//</editor-fold>

var app = express();

//<editor-fold desc="Express Routes">
//main route
app.get('/', function(req, res){
    fs.readFile('./index.html', function (err, html) {
        if (err) {
            console.log(err.toString().red);
            res.send(404);
            return;
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
            console.log(err.toString().red);
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
    //think of writing response in form.on('end',....);
    form.parse(req, function(err, fields, files) {
        if(!res.headersSent) {//if user uploads file, refreshes, then uploads again, app will crash without this check
            res.writeHead(200, {'content-type': 'text/plain'});
        }
        res.write('received upload:\n\n');
        res.end(util.inspect({fields: fields, files: files}));
    });
});

//</editor-fold>

var port = 8000;
var server = app.listen(port, console.log('Listening on port '+port+'...'));

var io = socket.listen(server);
var nsp = io.of('/data');//custom namespace, automatically hoisted variable => visible to form
var sockets = {};//socket dict

nsp.on('connection', function(socket){
    socket.on('customSocket', function(data){//receiving custom socket id
        sockets[data.customId] = socket.id;
    });
    console.log('sent the json');
});


