//modules used
var fs = require('fs');//file system
var http = require('http');//server
var url = require('url');
var path =require('path');
var mime = require('mime');
var qs = require('querystring');
var socket = require('socket.io');//socket.io fast message relay
var colors = require('colors');//pretty console output
var express = require('express');
var session = require('express-session');//session manager for stateful web

var key = "Hash Browns";
var cookieparser = require('cookie-parser')(key);
var RedisStore = require('connect-redis')(session);

redis = new RedisStore({
    host: 'localhost',
    port: 6379
});

var userData = {};
var sockets = {};//socket dict

var app = express();
var port = 8000;
var server = app.listen(port, console.log('Listening on port '+port+'...'));

var nsp = require('./routes/socket.io.js')({
    "server": server, "sockets": sockets, "userData": userData
});//pass global vars by reference

app.use(cookieparser);
app.use(session(
        {
            secret: key,
            store: redis, //taken from app context
            genid: function () {
                return genuuid();
            }
        })
);

app.use('/', require('./routes/index.js')(userData));
app.use('/upload', require('./routes/upload.js')(userData, nsp, sockets));




