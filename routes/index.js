var router = require('express').Router();
var url = require('url');
var mime = require('mime');
var fs = require('fs');
var colors = require('colors');
var url = require('url');

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
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;
        var messages = userData[req.sessionID]['chats'][query.q]['messages'];
        var re = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
        var results;
        var link_dict = {};
        var host = "";
        for (var msg in messages){
            results = messages[msg]['text'].match(re);
            for (var link in results){
                host = url.parse(results[link]).host;
                if(host in link_dict) {
                    link_dict[host].push(results[link]);
                }
                else{
                    link_dict[host] = [results[link]];
                }
            }
        }

        res.end(JSON.stringify(link_dict));
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
