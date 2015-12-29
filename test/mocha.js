require('mocha');
var embedSass = require('../');
var assert = require('assert');
var fs = require('fs');
var File = require('gulp-util').File;

//var fixtures = function (glob) { return path.join(__dirname, 'fixtures', glob); };

describe('gulp-angular2-embed-sass', function () {
    it('should embed style content whenever specified styleUrls', function (done) {
        // Create a 'gulp-angular2-embed-sass' plugin stream
        var sut = embedSass();

        // create the fake file
        var fakeFile = new File({
            contents: new Buffer(fs.readFileSync('test/assets/test.component.ts'))
        });

        console.log('fakeFile');
        console.log(fakeFile.path);

        // write the fake file to it
        // sut.write(fakeFile);

        // wait for the file to come back out
        sut.once('data', function (file) {
            // make sure it came out the same way it went in
            assert(file.isBuffer());

            // check the contents
            assert.equal(file.contents.toString('utf8'),
                'angular.module(\'test\').directive(\'helloWorld\', function () {\n' +
                '    return {\n' +
                '        restrict: \'E\',\n' +
                '        template:\'<strong>Hello World!</strong>\'\n' +
                '    };\n' +
                '});'
            );
            done();
        });
    });

    // it('should dial with single quoted template paths', function (done) {
    //     var sut = embedSass();
    //     var fakeFile = new File({contents: new Buffer('templateUrl: \'test/assets/hello-world-template.html\'')});
    //     sut.write(fakeFile);
    //     sut.once('data', function (file) {
    //         assert.equal(file.contents.toString('utf8'), 'template:\'<strong>Hello World!</strong>\'');
    //         done();
    //     });
    // });

    // it('should dial with double quoted template paths', function (done) {
    //     var sut = embedSass();
    //     var fakeFile = new File({contents: new Buffer('templateUrl: "test/assets/hello-world-template.html"')});
    //     sut.write(fakeFile);
    //     sut.once('data', function (file) {
    //         assert.equal(file.contents.toString('utf8'), 'template:\'<strong>Hello World!</strong>\'');
    //         done();
    //     });
    // });

    // it('should dial with single quoted templateUrl key', function (done) {
    //     var sut = embedSass();
    //     var fakeFile = new File({contents: new Buffer('\'templateUrl\': \'test/assets/hello-world-template.html\'')});
    //     sut.write(fakeFile);
    //     sut.once('data', function (file) {
    //         assert.equal(file.contents.toString('utf8'), 'template:\'<strong>Hello World!</strong>\'');
    //         done();
    //     });
    // });

    // it('should dial with double quoted templateUrl key', function (done) {
    //     var sut = embedSass();
    //     var fakeFile = new File({contents: new Buffer('"templateUrl": \'test/assets/hello-world-template.html\'')});
    //     sut.write(fakeFile);
    //     sut.once('data', function (file) {
    //         assert.equal(file.contents.toString('utf8'), 'template:\'<strong>Hello World!</strong>\'');
    //         done();
    //     });
    // });

    // it('should dial with templateUrl {SPACES} : {SPACES} {url} ', function (done) {
    //     var sut = embedSass();
    //     var fakeFile = new File({contents: new Buffer('"templateUrl" \t\r\n:\r\n\t  \'test/assets/hello-world-template.html\'')});
    //     sut.write(fakeFile);
    //     sut.once('data', function (file) {
    //         assert.equal(file.contents.toString('utf8'), 'template:\'<strong>Hello World!</strong>\'');
    //         done();
    //     });
    // });

    // it('should dial with templateUrl {SPACES} : {SPACES} {url} ', function (done) {
    //     var sut = embedSass();
    //     var fakeFile = new File({contents: new Buffer('"templateUrl" \t\r\n:\r\n\t  \'test/assets/hello-world-template.html\'')});
    //     sut.write(fakeFile);
    //     sut.once('data', function (file) {
    //         assert.equal(file.contents.toString('utf8'), 'template:\'<strong>Hello World!</strong>\'');
    //         done();
    //     });
    // });

    // it('should skip errors if particular flag specified', function (done) {
    //     var sut = embedSass({skipErrors: true});
    //     var fakeFile = new File({contents: new Buffer(JSON.stringify({
    //         templateUrl: 'test/assets/hello-world-template.html',
    //         l2: {templateUrl: 'test/assets/hello-world-template2.html'},
    //         l3: {templateUrl: 'test/assets/hello-world-template.html'}
    //     }))});
    //     sut.write(fakeFile);
    //     sut.once('data', function (file) {
    //         assert.equal(file.contents.toString('utf8'), '{template:\'<strong>Hello World!</strong>\',"l2":{"templateUrl":"test/assets/hello-world-template2.html"},"l3":{template:\'<strong>Hello World!</strong>\'}}');
    //         done();
    //     });
    // });

    // it('should use basePath to find the templates if specified', function (done) {
    //     var tplStats = fs.statSync('test/assets/hello-world-template.html');
    //     var sut = embedSass({ basePath: 'test' });
    //     var entry = JSON.stringify({
    //         templateUrl: '/assets/hello-world-template.html'
    //     });
    //     var fakeFile = new File({contents: new Buffer(entry)});
    //     sut.write(fakeFile);
    //     sut.once('data', function (file) {
    //         assert.equal(file.contents.toString('utf8'), '{template:\'<strong>Hello World!</strong>\'}');
    //         done();
    //     });
    // });

    // it('should ignore files bigger than the maxSize specified', function (done) {
    //     var tplStats = fs.statSync('test/assets/hello-world-template.html');
    //     var sut = embedSass({maxSize: tplStats.size - 1});
    //     var entry = JSON.stringify({
    //         templateUrl: 'test/assets/hello-world-template.html'
    //     });
    //     var fakeFile = new File({contents: new Buffer(entry)});
    //     sut.write(fakeFile);
    //     sut.once('data', function (file) {
    //         assert.equal(file.contents.toString('utf8'), entry);
    //         done();
    //     });
    // });
});
