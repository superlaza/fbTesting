/**
 * Created by David on 8/1/2014.
 */
var express = require('express');

//var key = "Hash Browns";
//var cookieparser = require('cookie-parser')(key);
//var socket = require('socket.io');
//var io_client = require('../../node_modules/socket.io/node_modules/socket.io-client/index.js');
var should = require('should');
var request = require('supertest');
//var upload = require('../../routes/upload.js');

var sockets = {};
var userData = {};

var app = express();
var server = app.listen();

var supertest = request(app);
//app.listen(8001);

//var port = 8001;
//var server = app.listen(port, console.log('Listening on port '+port+'...'));
//
//var io = socket.listen(server);
//var nsp = require('../../routes/modules/socket.io.js')({
//    "server": server, "sockets": sockets, "userData": userData
//});

app.post("/upload", function(req, res) {
    res.send(200);
});

//servers send error based on missing content length, sometimes
describe("uploading of doc", function (){

    it("should see post", function(done){
        request(server)
            .post('/upload')
            .set({
                'Content-Type': 'text/html',
                'Content-Length': '12341248'
            })
            .send('{"name":"tj","pet":"tobi"}')
//                        .attach('messages', 'C:/Projects/fbTesting/test/upload/messages.htm')
            .expect(200)
            .end(function(err, res){
                should.not.exist(err);
                console.log(err);
                console.log(res);
            });

//        headers: {
//            'Content-Type': 'application/json; charset=utf-8',
//                'Content-Length': Buffer.byteLength(post_data),
//                'Accept': 'application/json',
//                'Accept-Encoding': 'gzip,deflate,sdch',
//                'Accept-Language': 'en-US,en;q=0.8'
//        }
    });

});

//used when an assertion is called from nested scope, not it(), so only this scope can capture what would be uncaught exceptions from here
//because of the asynchronous nature of some functions, calling them within it could cause execution to fall outside of it...
//meaning it can no longer catch the exceptions that take place within
function check( done, f ) {
    try {
        f();
        done();// success: call done with no parameter to indicate that it() is done()
    } catch(e) {
        done(e);// failure: call done with an error Object to indicate that it() failed
    }
}