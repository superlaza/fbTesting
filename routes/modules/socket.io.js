var socket = require('socket.io');
var key = "Hash Browns";
var cookieparser = require('cookie-parser')(key);
var fs = require('fs');//file system

module.exports= function(params) {
    var io = socket.listen(params.server);
    var nsp = io.of('/data').use(function (socket, next) {
        var handshake = socket.request;
        if (handshake.headers.cookie) {
            // pass a req, res, and next as if it were middleware
            cookieparser(handshake, null, function (err) {
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

    nsp.on('connection', function (socket) {
        params.sockets[socket.request.sessionID] = socket.id;

        //if the user already uploaded the messages file, find it
        //also should remove upload box, or put a re-upload box

        if (fs.existsSync("users/" + socket.request.sessionID + "/messages.json")) {
            fs.readFile('./users/' + socket.request.sessionID + '/messages.json', function (err, json) {
                if (err) {
                    console.log(err.toString().red);
                    res.send(404);
                    return;
                }
                params.userData[socket.request.sessionID] = JSON.parse(json);
            });
        }
    });

    return nsp;
};