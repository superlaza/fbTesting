var should = require('should');
var supertest = require('supertest');
var app = require('C:\\Projects\\fbTesting\\app.js');
var fs = require('fs');
var exec = require('child_process').spawn;
var rmdir = require('rimraf');

var cookieParser = require('cookie-parser');


var request = supertest(app.app);

describe('upload', function() {
    var html;
    var pythonChild;
    before(function(done) {
        var html = fs.readFileSync('test/upload/messages.htm', 'utf-8');
        var pythonChild = exec('C:\\Projects\\fbTesting\\redis-2.8\\bin\\release\\redis-2.8.12\\redis-server.exe');
        done();
    });

    after(function(done){
//        var pythonChild = exec('taskkill /F /IM redis-server.exe');
        console.log(('C:/Projects/fbTesting/users/'+app.userID));
        rmdir('users/'+app.userID, function(err){
            throw err;
            console.log('testing');
            console.log(err);
        });
        done()
    });

    var agent1 = supertest.agent();
    var agent2 = supertest.agent();
    var agent3 = supertest.agent(app.app);

//    it('should gain a session on POST', function(done) {
//        agent3
//            .post('/upload')
//            .end(function(err, res) {
//                should.not.exist(err);
//                res.should.have.status(200);
//                should.not.exist(res.headers['set-cookie']);
//                res.text.should.include('dashboard');
//                done();
//            });
//    });

    it('should receive upload', function(done) {
        agent3
            .post('/upload')
            .attach('avatar', 'test/upload/messages.htm', 'messages.htm')
            .end(function (err, res) {
                should.not.exist(err);
                res.status.should.equal(200); //response indicates success
                should.exist(res.headers['set-cookie']);
                console.log(app.userID);
                done();//finish this test
            });

//        var req = request.post('/upload');
//        req.part()
//            .set('Content-Type', 'text/html')
//            .set('Content-Disposition', 'attachment; filename="myimage.png"')
//            .write('some image data')
//        .end(function (err, res) {
//            should.not.exist(err);
//            res.status.should.equal(200); //response indicates success
//            done();//finish this test

//        var t = request
//            .post('/upload')
//            .type('html')
////            .attach('test', 'test/upload/messages2.html');
//            .send(html);
//        t.end(function (err, res) {
//            should.not.exist(err);
//            res.status.should.equal(200); //response indicates success
//            done();//finish this test
//
//        });
    });

    rmdir('C:/Projects/fbTesting/users/'+app.userID, function(err){
        throw err;
        console.log('testing');
        console.log(err);
    });
});

rmdir('C:/Projects/fbTesting/users/'+app.userID, function(err){
    throw err;
    console.log('testing');
    console.log(err);
});