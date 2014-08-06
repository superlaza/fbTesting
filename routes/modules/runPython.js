var fs = require('fs');
var exec = require('child_process').spawn;

//TODOO:consider how feasible it is to pipe data output from python straight through command line so node has the data quicker, node can do writing when it has time


//@param {Object} opts contains the necessary resources to run the python analysis, all fields are required
//@param {string} opts.sessionID the session id for the session issuing the request
//@param {string} opts.outputDirs the collection of directories to which python will output data
//@param {string} opts.nsp the namespace created using socket.io
//@param {string} opts.sockets the custom socket data structure used to store active sockets
//@param {string} opts.userData the dict used to store pre-loaded data of users that are currently connected
//@param {string} opts.filename the name of the file that was uploaded by the user
module.exports = function runPython(opts){
    var path = "./users/"+opts.sessionID.toString();
    var outputDirs = {};
    for (var key in opts.datadict){
        outputDirs[key] = opts.datadict[key].outputDir;
    }
    var pythonChild = exec('python', ['python/userDataProc.py', path+'/uploads/'+opts.filename, JSON.stringify({"user":opts.sessionID.toString(), "dirs":outputDirs})]);



    //register event listeners
    pythonChild.stdout.on('data', function (data) {
        if(typeof data != 'undefined') {
            if (data.toString()[0] == "-") {//this means we're receiving progress data
                process.stdout.write(data.toString().split('\r')[0] + "\033[0G");//strings comes with a carriage return
            }

            else {
                var key = data.toString().split('\r')[0];
                if(Object.keys(opts.datadict).indexOf(key) != -1){
                    fs.readFile(path + opts.datadict[key].outputDir, 'utf8', function (err, json) {
                        if (err) {
                            console.log(err.toString().red);
                        }

                        //pick our socket from the list of sockets connected under this namespace
                        opts.nsp.connected[opts.sockets[opts.sessionID]].emit(opts.datadict[key].event, JSON.parse(json));
                        console.log(opts.datadict[key].log.green)
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
        throw new Error(data);
    });

    pythonChild.on('close', function (code) {
        if (code != 0) {
            console.log('python closed with an error'.red);
        }

        //when python outputs the user json file, load it up
        fs.readFile('./users/'+opts.sessionID+'/messages.json', function (err, json) {
            if (err) {
                console.log(err.toString().red);
                //res.send(404);//error should bubble upwards
                return;
            }
            opts.userData[opts.sessionID] = JSON.parse(json);
        });
    });
};