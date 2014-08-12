var fs = require('fs');

//@param {string} userPath the directory where particular user data is stored
module.exports = function createUserDir(userPath){
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
};
