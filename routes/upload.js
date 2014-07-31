module.exports = function(userData, nsp, sockets){
    var router = require('express').Router();
    var colors = require('colors');
    var formidable = require('formidable');//form handling
    var fs = require('fs');
    var exec = require('child_process').spawn;
    var util = require('util');

    //the output locations for python results
    var outputDirs = {
        "timeline": "/data/wordcount.json",
        "hour_histogram": "/data/hourhisto.json"
    };

    //post handling
    //TODOO: modify action in html to use custom router
    router.post('/', function(req, res){
        var id = req.sessionID.toString();

        //make directory for specific user issuing request
        createUserDir("./users/"+id);

        var pyOpts = {"sessionID": id, "outputDirs": outputDirs};

        //<editor-fold desc="Formidable Initialization and Event Registration">
        //TODOO: ALL POSSIBLE FORM STATE EVOLUTIONS SHOULD BE ACCOUNTED FOR
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
            file.path = "./users/"+id+'/uploads/'+file.name;
        });

        //register this callback to progress event to display progress
        form.on('progress', function(bytesReceived, bytesExpected) {
            var percent_complete = (bytesReceived / bytesExpected) * 100;
            process.stdout.write("upload progress: "+percent_complete.toFixed(2)+"%\033[0G"); //replace this code with \r for linux
        });

        form.on('end', function(){
            console.log("");
            runPython(pyOpts);
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

    function createUserDir(userPath){
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
    }

    function runPython(opts){
        var path = "./users/"+opts.sessionID.toString();
        var pythonChild = exec('python', ['python/userDataProc.py', path+'/uploads/messages.htm', JSON.stringify({"user":opts.sessionID.toString(), "dirs":outputDirs})]);

        var datadict = {
            "hour_histogram": {
                key: 'hour_histogram',
                event: 'radar',
                log: 'sent hour histogram data to frontend....'
            },
            "timeline": {
                key: 'timeline',
                event: 'bar',
                log: 'sent timeline data to frontend....'
            }
        };

        //register event listeners
        pythonChild.stdout.on('data', function (data) {
            if(typeof data != 'undefined') {
                if (data.toString()[0] == "-") {//this means we're receiving progress data
                    process.stdout.write(data.toString().split('\r')[0] + "\033[0G");//strings comes with a carriage return
                }

                else {
                    var key = data.toString().split('\r')[0];
                    if(Object.keys(datadict).indexOf(key) != -1){
                        fs.readFile(path + opts.outputDirs[key], 'utf8', function (err, json) {
                            if (err) {
                                console.log(err.toString().red);
                            }

                            //pick our socket from the list of sockets connected under this namespace
                            nsp.connected[sockets[opts.sessionID]].emit(datadict[key].event, JSON.parse(json));
                            console.log(datadict[key].log.green)
                        });
                    }
                }
            }
            else{
                console.log("couldn't read python output");
            }
        });

        pythonChild.stderr.on('data', function (data) {
            console.log(data.toString().red);
        });

        pythonChild.on('close', function (code) {
            if (code != 0) {
                console.log('python closed with an error'.red);
            }

            //when python outputs the user json file, load it up
            fs.readFile('./users/'+opts.sessionID+'/messages.json', function (err, json) {
                if (err) {
                    console.log(err.toString().red);
                    res.send(404);
                    return;
                }
                userData[opts.sessionID] = JSON.parse(json);
            });
        });
    }

    return router;
};