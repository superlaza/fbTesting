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
//Since userData is passed in by reference, whenever the user's data is loaded this structure will be populated
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

    router.get('/links.js', function (req, res) {
        //TODOO: send the messages structure to frontend to put the computational burden on the browser, not the server
        //the above would require rolling your own url parser (shouldn't be difficult at all, we only need host name really)
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;
        var messages = userData[req.sessionID]['chats'][query.q]['messages'];


        res.end(JSON.stringify(messages));
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
