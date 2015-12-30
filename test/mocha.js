require('mocha');

var embedSass = require('../');
var assert    = require('assert');
var fs        = require('fs');
var File      = require('gulp-util').File;


describe('gulp-angular2-embed-sass', function () {
    it('should embed style content whenever specified styleUrls', function (done) {
        // Create a 'gulp-angular2-embed-sass' plugin stream
        var emb = embedSass();

        done();
    });
});
