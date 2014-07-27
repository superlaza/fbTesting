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
var session = require('express-session');//session manager for stateful web

var key = "Hash Browns";

var cookieparser = require('cookie-parser')(key);
var RedisStore = require('connect-redis')(session);

//relative to directory from which exec spawn is invoked
var outputDirs = {"wordcount": "/data/wordcount.json",
    "hour_histogram": "/data/hourhisto.json"};

var app = express();

app.use(cookieparser);

//client: An existing redis client object you normally get from redis.createClient()
//host: Redis server hostname
//port: Redis server portno
//ttl: Redis session TTL in seconds
//db: Database index to use
//pass: Password for Redis authentication
//prefix: Key prefix defaulting to "sess:"
//url: String that contains connection information in a single url (redis://user:pass@host:port/db)
//... Remaining options passed to the redis createClient() method.

//currently using default options
var options = {
    host: 'localhost',
    port: 6379
};

app.use(session(
        {
            secret: key,
            store: new RedisStore(),
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
    console.log(req.sessionID.toString().yellow);
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

    var userPath = "./users/"+req.sessionID.toString();
    //make directory for specific user issuing request
    //synchronous because this must happen before anything that follows
    if (!fs.existsSync(userPath)) {//if dir isn't there, create
        try {
            fs.mkdirSync(userPath, 0755);
            fs.mkdirSync(userPath + '/uploads', 0755);
            fs.mkdirSync(userPath + '/data', 0755);
        }
        catch (error) {
            console.log("Failed to make user directories...".red);
            console.log(error.toString().red);
        }
    }

    else{//if dir exists, make sure it's subdirs are there
        if (!fs.existsSync(userPath + '/uploads')){
            try {
                fs.mkdirSync(userPath + '/uploads', 0755);
            }
            catch (error) {
                console.log("Failed to make user 'upload' directory...".red);
                console.log(error.toString().red);
            }
        }
        if (!fs.existsSync(userPath + '/data')){
            try {
                fs.mkdirSync(userPath + '/data', 0755);
            }
            catch (error) {
                console.log("Failed to make user 'data' directory...".red);
                console.log(error.toString().red);
            }
        }
    }

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
        file.path = userPath+'/uploads/'+file.name;
    });

    //register this callback to progress event to display progress
    form.on('progress', function(bytesReceived, bytesExpected) {
        var percent_complete = (bytesReceived / bytesExpected) * 100;
        console.log(percent_complete.toFixed(2));
    });

    form.on('end', function(){
        var pythonChild = exec('python', ['python/userDataProc.py', userPath+'/uploads/messages.htm', JSON.stringify({"user":req.sessionID.toString(), "dirs":outputDirs})]);
        console.log(req.sessionID.toString().red);
        pythonChild.stdout.on('data', function (data) {
            //these consecutive if's can be iterated programmatically
            //need to ensure that data is streamed as its received from python
            if (data.toString().indexOf('timeline') != -1) {

                fs.readFile(userPath+outputDirs['wordcount'], 'utf8', function (err, json) {
                    if (err) {
                        console.log(err.toString().red);
                    }

                    //pick our socket from the list of sockets connected under this namespace
                    nsp.connected[sockets[req.sessionID]].emit('bar', JSON.parse(json));
                    console.log('sent timeline data to frontend....')
                });
            }

            if (data.toString().indexOf('hour_histogram') != -1) {

                fs.readFile(userPath+outputDirs['hour_histogram'], 'utf8', function (err, json) {
                    if (err) {
                        console.log(err.toString().red);
                    }

                    //pick our socket from the list of sockets connected under this namespace
                    nsp.connected[sockets[req.sessionID]].emit('radar', JSON.parse(json));
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

var io = socket.listen(server);
var nsp = io.of('/data').use( function (socket, next) {
    var handshake = socket.request;
    if (handshake.headers.cookie) {
        // pass a req, res, and next as if it were middleware
        cookieparser(handshake, null, function(err) {
            handshake.sessionID = handshake.signedCookies['connect.sid'];
            // or if you don't have signed cookies
//            handshake.sessionID = handshake.cookies['connect.sid'];

//            sessionStore.get(handshake.sessionID, function (err, session) {
//                if (err || !session) {
//                    console.log('didn"t find session');
//                    // if we cannot grab a session, turn down the connection
//                    callback('Session not found.', false);
//                } else {
//                    // save the session data and accept the connection
//                    handshake.session = session;
//                    callback(null, true);
//                }
//            });
        });
        next();
    } else {
        next(new Error('No session found'));
    }
});//custom namespace, automatically hoisted variable => visible to form
var sockets = {};//socket dict

nsp.on('connection', function(socket){
    console.log(socket.request.sessionID.toString().green);
    sockets[socket.request.sessionID] = socket.id;
});

function genuuid() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}