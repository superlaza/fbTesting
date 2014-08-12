var fs = require('fs');
var exec = require('child_process').spawn;

//@param {Object} opts contains the necessary resources to run the python analysis, all fields are required
//@param {string} opts.sessionID the session id for the session issuing the request
//@param {string} opts.outputDirs the collection of directories to which python will output data
//@param {string} opts.nsp the namespace created using socket.io
//@param {string} opts.sockets the custom socket data structure used to store active sockets
//@param {string} opts.userData the dict used to store pre-loaded data of users that are currently connected
module.exports = function runPython(opts){
    var path = "./users/"+opts.sessionID.toString();
    var pythonChild = exec('python', ['python/userDataProc.py', path+'/uploads/messages.htm', JSON.stringify({"user":opts.sessionID.toString(), "dirs":opts.outputDirs})]);

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
                        opts.nsp.connected[opts.sockets[opts.sessionID]].emit(datadict[key].event, JSON.parse(json));
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
            opts.userData[opts.sessionID] = JSON.parse(json);
        });
    });
};