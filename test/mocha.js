require('mocha');

var embedSass = require('../index.js');
var assert    = require('assert');
var fs        = require('fs');
var File      = require('gulp-util').File;


describe('gulp-angular2-embed-sass', function () {
    it('should embed style content whenever specified styleUrls', function (done) {

        // Create a 'gulp-angular2-embed-sass' plugin stream
        //
        var emb = embedSass();

        var fakeFile = new File({
            contents: new Buffer(fs.readFileSync('test/assets/test.component.ts'))
        });
        
        fakeFile.path = 'test.component.ts';
        emb.write(fakeFile);
        emb.once('data', function (file) {

            assert(file.isBuffer());

            // check the contents
            //
            assert.equal(file.contents.toString('utf8'),
                        new Buffer(fs.readFileSync('test/assets/assert.component.ts')).toString('utf8')
            );
            done();
        });
    });
});

describe('gulp-angular2-embed-sass', function () {
    it('less: should embed style content whenever specified styleUrls', function (done) {

        // Create a 'gulp-angular2-embed-sass' plugin stream
        //
        var emb = embedSass({type: 'less'});

        var fakeFile = new File({
            contents: new Buffer(fs.readFileSync('test/assets/testless.component.ts'))
        });
        
        fakeFile.path = 'testless.component.ts';
        emb.write(fakeFile);
        emb.once('data', function (file) {

            assert(file.isBuffer());

            // check the contents
            //
            assert.equal(file.contents.toString('utf8'),
                        new Buffer(fs.readFileSync('test/assets/assertless.component.ts')).toString('utf8')
            );
            done();
        });
    });
});
