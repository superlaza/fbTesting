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
var session = require('express-session');
var cookieparser = require('cookie-parser')('Hash Browns');
var sessionStore = new session.MemoryStore();

//relative to directory from which exec spawn is invoked
var outputDirs = {"wordcount":"./data/wordcount.json",
    "hour_histogram": "./data/hourhisto.json"};

var app = express();

app.use(cookieparser);
app.use(session(
        {
            secret: 'Hash Browns',
            store: sessionStore,
            genid: function () {
                return genuuid();
            }
        })
);

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
    console.log(req.sessionID);
    console.log('\n\n');
    console.log('\n\n');
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
        var pythonChild = exec('python', ['python/userDataProc.py', './uploads/messages.htm', JSON.stringify(outputDirs)]);

        pythonChild.stdout.on('data', function (data) {
            //these consecutive if's can be iterated programmatically
            //need to ensure that data is streamed as its received from python
            if (data.toString().indexOf('timeline') != -1) {

                fs.readFile(outputDirs['wordcount'], 'utf8', function (err, json) {
                    if (err) {
                        console.log(err.toString().red);
                    }

                    //pick our socket from the list of sockets connected under this namespace
                    nsp.connected[sockets['dataSocket']].emit('bar', JSON.parse(json));
                    console.log('sent timeline data to frontend....')
                });
            }

            if (data.toString().indexOf('hour_histogram') != -1) {

                fs.readFile(outputDirs['hour_histogram'], 'utf8', function (err, json) {
                    if (err) {
                        console.log(err.toString().red);
                    }

                    //pick our socket from the list of sockets connected under this namespace
                    nsp.connected[sockets['dataSocket']].emit('radar', JSON.parse(json));
                    console.log('sent hour histogram data to frontend....')
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
var store = new session.MemoryStore();

var io = socket.listen(server);
io.set('authorization', function(handshake, callback) {
    if (handshake.headers.cookie) {
        // pass a req, res, and next as if it were middleware
        cookieparser(handshake, null, function(err) {
            handshake.sessionID = handshake.signedCookies['connect.sid'];
            // or if you don't have signed cookies
            handshake.sessionID = handshake.cookies['connect.sid'];

            sessionStore.get(handshake.sessionID, function (err, session) {
                if (err || !session) {
                    // if we cannot grab a session, turn down the connection
                    callback('Session not found.', false);
                } else {
                    // save the session data and accept the connection
                    handshake.session = session;
                    callback(null, true);
                }
            });
        });
    } else {
        return accept('No session.', false);
    }
    callback(null, true);
});
var nsp = io.of('/data');//custom namespace, automatically hoisted variable => visible to form
var sockets = {};//socket dict

nsp.on('connection', function(socket){
    console.log((socket.handshake.sessionID));
    socket.on('customSocket', function(data){//receiving custom socket id
        sockets[data.customId] = socket.id;
    });
});

function genuuid() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}