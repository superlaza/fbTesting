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

        var exec = require('child_process').exec;
        exec('rmdir /s /q '+'users\\'+app.userID,function(err,out) {
            console.log(out); err && console.log(err);
            done();
        });
    });
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
});
