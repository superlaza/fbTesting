var router = require('express').Router();
var url = require('url');
var mime = require('mime');
var fs = require('fs');
var colors = require('colors');

module.exports = function(userData) {
//<editor-fold desc="Express Routes">
//main route
    router.get('/', function (req, res) {
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
//for live search, SHOULD ONLY SHOW AFTER WE ARE SURE WE HAVE
//USER DATA
    router.get('/livesearch.js', function (req, res) {
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;
        var users = Object.keys(userData[req.sessionID]['chats']);
        var results = [];
        for (var i = 0; i < users.length; ++i) {
            if (users[i].indexOf(query.q) != -1) {
                results.push(users[i]);
            }
        }
        res.end(JSON.stringify(results));
    });

//any other request, find file and server
    router.get('*', function (req, res) {
        var uri = url.parse(req.url).pathname;
        fs.readFile('./' + uri, function (err, data) {
            if (err) {
                //file can't be found
                console.log(err.toString().red);
                res.send(404);
                return;
            }

            res.set('Content-Type', mime.lookup(uri));
            res.send(data);
        });
    });

    return router;
};

function genuuid() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}
