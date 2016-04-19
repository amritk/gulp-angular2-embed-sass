require('mocha');

var embedSass = require('../');
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
        emb.write(fakeFile);
        emb.once('data', function (file) {

            assert(file.isBuffer());

            // check the contents
            //
            assert.equal(file.contents.toString('utf8'),
                'import {Component} from \'angular2/core\';\n\n' +
                '@Component({\n' +
                '    selector: \'app\',\n' +
                '    templateUrl: \'test/assets/test.component.html\',\n' +
                '    styles: [`h1 {  font-size: 200px; }\', \'h5 {  color: red; }`]\n' +
                '})\n\n' +
                'export class AppComponent { }\n'
            );
            done();
        });
    });
});
