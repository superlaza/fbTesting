//modules used
var fs = require('fs');
var http = require('http');
var url = require('url');
var path =require('path');
var mime = require('mime');//downloaded with npm
var qs = require('querystring');


//for formidable
var formidable = require('formidable');
var util = require('util');

//socket.io
var socket = require('socket.io');

//custom events firing
var events = require('events');

//handle transport of data
var dataTransport = function(){this.data = undefined};
//inherit props from EventEmitter
dataTransport.prototype = new events.EventEmitter;
var dt = new dataTransport();


//read main file, when done launch server
fs.readFile('./index.html', function (err, html) {
    if (err) {
        console.log(err); 
    }

    var app = http.createServer(function(req, res) {
        //this method should be in a handler pointed to by action
        //consider returning from createServer function after POST req
        if (req.method == 'POST') {

            // parse a file upload
            var form = new formidable.IncomingForm();

            //set params
            form.uploadDir = './img';
            form.keepExtensions = true;

            //register listener on file reception event
            //in order to change file path to one with file's original name
            //default generates random name for storage
            form.on('fileBegin', function(name, file) {
                //save to current directory
                //need to specify file path at moment of file discovery
                //otherwise it will be ignored when the writestream is created
                //file.path = '../uploads/'+file.name;

                //HARDCODED FILE NAME FOR NOW, NEED TO TEST FOR HTML
                file.path = './uploads/data.html';
            });

            //register this callback to progress event to display progress
            form.on('progress', function(bytesReceived, bytesExpected) {
                var percent_complete = (bytesReceived / bytesExpected) * 100;
                console.log(percent_complete.toFixed(2));
            });

            form.on('end', function(){
                fs.readFile('./uploads/wordcount.json', 'utf8', function (err, json) {
                    if (err) {
                        console.log(err);
                    }

                    dt.data = JSON.parse(json);
                    //dt.emit('data');
                   // dataFlag = true;
                    //sendProcData(json);

                    /*
                    io.on('connect', function (socket) {
                        //socket.emit('server', JSON.parse(json));

                        /*testing
                        socket.on('client', function (data) {
                            console.log(data);
                        });

                    });*/
                });
            });

            //think of writing response in form.on('end',....);
            form.parse(req, function(err, fields, files) {
                res.writeHead(200, {'content-type': 'text/plain'});
                res.write('received upload:\n\n');
                res.end(util.inspect({fields: fields, files: files}));

                //show file names
                //console.log(files);
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

            return; //end transaction
            
        }//end POST handler

        //if it's not a post, serve the file being requested
        //need to check (mime) type of requested file. downloaded mime module to help
        var uri = url.parse(req.url).pathname;

        //if website is accessed by http://localhost:8000, fetch index (index.html)
        if (uri == "/")
        {
            uri = "index.html";
            //serve preloaded html
            res.setHeader('content-type', mime.lookup(uri));
            res.writeHead(200);
            res.end(html);

            //end transaction
            return;
        }

        //otherwise lookup file and server
        //read file based on type
        //currently one folder up
        fs.readFile('./'+uri,
            function (err, data)
            {
                if (err)
                {
                    res.writeHead(500);
                    return res.end('Error loading index.html');
                }

                //console.log(req.url);//shows action url
                console.log('../'+uri);
                res.setHeader('content-type', mime.lookup(uri));
                res.writeHead(200);
                res.end(data);
            });

    });

    var io = socket(app);
    app.listen(8000);

    io.on('connection', function(socket){
        console.log(dt.data);
        socket.emit('server', dt.data);
        /*
        dt.on('data', function(){
            console.log('when');
            socket.emit('server', dataTransport.data);
        });*/
    });

    function sendProcData(json) {
        io.on('connection', function (socket) {
            socket.emit('server', json);
        });
    }
    console.log("Server listening on port 8000...");
});

