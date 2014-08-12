var fs = require('fs');
module.exports = function(userData, nsp, sockets){
    var router = require('express').Router();
    var colors = require('colors');
    var formidable = require('formidable');//form handling

    //custom modules
    var runPython = require('./modules/runPython.js');
    var createUserDir = require('./modules/createUserDir.js');
    var createFormParser = require('./modules/createForm.js');

    //the output locations for python results
    var datadict = {
        "hour_histogram": {
            key: 'hour_histogram',
            event: 'radar',
            log: 'sent hour histogram data to frontend....',
            outputDir: "/data/wordcount.json"
        },
        "timeline": {
            key: 'timeline',
            event: 'bar',
            log: 'sent timeline data to frontend....',
            outputDir: "/data/hourhisto.json"
        }
    };

    //post handling
    router.post('/', function(req, res){
        var id = req.sessionID.toString();
        //make directory for specific user issuing request
        createUserDir("./users/"+id);

        var pyOpts = {
            "sessionID": id,
            "datadict": datadict,
            "nsp": nsp,
            "sockets": sockets,
            "userData": userData
        };

        var parse = createFormParser(pyOpts);
        parse(req, res);

    });

    return router;
};