//modules used
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

var userData = {};//TODOO: need to data of unconnected users
var sockets = {};//socket dict, TODOO: need to remove closed sockets after each cycle (based on their connection attribute, or something)

var app = express();
var port = 8000;
var server = app.listen(port, console.log('Listening on port '+port+'...'));

//to see remote function definition in webstorm, use ctrl+shift+i

var nsp = require('./routes/modules/socket.io.js')({
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

function genuuid() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}


