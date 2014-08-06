var runPython = require('./runPython.js');
var util = require('util');

module.exports = function parse(opts){
    var formidable = require('formidable');

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
        file.path = "./users/"+opts.sessionID+'/uploads/'+file.name;
        opts["filename"] = file.name;
    });

    //register this callback to progress event to display progress
    form.on('progress', function(bytesReceived, bytesExpected) {
        var percent_complete = (bytesReceived / bytesExpected) * 100;
        process.stdout.write("upload progress: "+percent_complete.toFixed(2)+"%\033[0G"); //replace this code with \r for linux
    });

    form.on('end', function(){
        console.log("");//create gap in console
        try {
            runPython(opts);
        }
        catch(err){
            //catch errors
        }
    });

    form.on('error', function(err){
        console.log("File upload error: "+err);
        res.send("File upload error: "+err, 500);
        throw err;
    });


    return function(req, res) {
        form.parse(req, function (err, fields, files) {
            if (!res.headersSent) {//if user uploads file, refreshes, then uploads again, app will crash without this check
                res.writeHead(200, {'content-type': 'text/plain'});
            }
            res.write('received upload:\n\n');
            res.end(util.inspect({fields: fields, files: files}));
        });
    }
};