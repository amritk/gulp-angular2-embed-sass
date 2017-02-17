var through        = require('through2');
var gutil          = require('gulp-util');
var pathModule     = require('path');
var sass           = require('node-sass');
var less           = require('less');
var fs             = require('fs');
var autoprefixer   = require('autoprefixer');
var postcss        = require('postcss');
var PluginError    = gutil.PluginError;


// Constants
//
const PLUGIN_NAME = 'gulp-angular2-embed-sass';

module.exports = function (options) {

    options = options || {};

    var content;
    var base;
    var matches;
    var styleUrlRegexp = /styleUrls[\'"\s]*:[\s]*\[(.*)\]/;

    const FOUND_SUCCESS = {};
    const FOUND_ERROR   = {};
    const CODE_EXIT     = {};

    var debug = false;
    function log() {
        if (debug) {
            console.log.apply(console, arguments);
        }
    }

    // Calls sass compiler on the file
    //
    function compileSass(sassPaths, cb) {

        if (sassPaths.length > 0) {

            var path = pathModule.join(base, sassPaths.shift());

            sass.render({
              file: path,
              includePaths: options.includePaths || []
            },
            function(err, result) {
                if (err) {
                    cb(FOUND_ERROR, 'Error while compiling sass template "' + path + '". Error from "node-sass" plugin: ' + err);
                }

                if (options.autoprefixer) {
                  // Call autoprefixer on current built css
                  postcss([ autoprefixer(options.autoprefixer) ])
                    .process(result.css)
                    .then(function(prefixedResult) {
                      // escape any backticks that comeup in the compiled css
                      cb(FOUND_SUCCESS, prefixedResult.css.toString().replace(/\\([\s\S])|(`)/g,"\\$1$2"), sassPaths);
                    });
                } else {
                  // escape any backticks that comeup in the compiled css
                  cb(FOUND_SUCCESS, result.css.toString().replace(/\\([\s\S])|(`)/g,"\\$1$2"), sassPaths);
                }
            });
        }
        else {
            cb(CODE_EXIT);
        }
    }

    // Calls sass compiler on the file
    //
    function compileLess(lessPaths, cb) {

        if (lessPaths.length > 0) {

            var path = pathModule.join(base, lessPaths.shift());
            var content = fs.readFileSync(path, 'utf8');

            less.render(
              content,
            
            function(err, result) {
                if (err) {
                    cb(FOUND_ERROR, 'Error while compiling less template "' + path + '". Error from "less" plugin: ' + err);
                }

                if (options.autoprefixer) {
                  // Call autoprefixer on current built css
                  postcss([ autoprefixer(options.autoprefixer) ])
                    .process(result.css)
                    .then(function(prefixedResult) {
                      // escape any backticks that comeup in the compiled css
                      cb(FOUND_SUCCESS, prefixedResult.css.toString().replace(/\\([\s\S])|(`)/g,"\\$1$2"), lessPaths);
                    });
                } else {
                  // escape any backticks that comeup in the compiled css
                  cb(FOUND_SUCCESS, result.css.toString().replace(/\\([\s\S])|(`)/g,"\\$1$2"), lessPaths);
                }
            });
        }
        else {
            cb(CODE_EXIT);
        }
    }

    // Writes the new css strings to the file buffer
    //
    function joinParts(entrances) {

        var parts = [];
        parts.push(Buffer(content.substring(0, matches.index)));
        parts.push(Buffer('styles: [\''));

        for (var i=0; i<entrances.length; i++) {
            parts.push(Buffer(entrances[i].replace(/\n/g, '')));
            if (i < entrances.length - 1) {
                parts.push(Buffer('\', \''));
            }
        }
        parts.push(Buffer('\']'));
        parts.push(Buffer(content.substr(matches.index + matches[0].length)));
        return Buffer.concat(parts);
    }

    function transform(file, enc, cb) {

        var pipe      = this;
        var entrances = [];
        var compilers = {
            sass: compileSass,
            less: compileLess
        }

        // Ignore empty files
        //
        if (file.isNull()) {
            cb(null, file);
            return;
        }

        if (file.isStream()) {
            throw new PluginError(PLUGIN_NAME, 'Streaming not supported. particular file: ' + file.path);
        }

        content = file.contents.toString('utf-8');
        base    = options.basePath ? options.basePath : pathModule.dirname(file.path);
        matches = styleUrlRegexp.exec(content);
        var compiler = compilers[options.type || 'sass'];

        // No matches
        //
        if (matches === null) {
            compileCallback(CODE_EXIT);
            return;
        }

        log('\nfile.path: ' + file.path);
        log('matches: ' + matches[1]);

        var sassPaths = matches[1].replace(/[\ '"]/g,"").split(',');
        compiler(sassPaths, compileCallback);


        function compileCallback(code, _string, sassPaths) {

            if (code === FOUND_SUCCESS) {
                entrances.push(_string);
                compiler(sassPaths, compileCallback);
            }
            else if (code === FOUND_ERROR) {
                if (options.skipErrors) {
                    gutil.log(
                        PLUGIN_NAME,
                        gutil.colors.yellow('[Warning]'),
                        gutil.colors.magenta(_string)
                    );
                    compiler(sassPaths, compileCallback);
                } else {
                    pipe.emit('error', new PluginError(PLUGIN_NAME, _string));
                }
            }
            else if (code === CODE_EXIT) {
                if (entrances.length) {
                    file.contents = joinParts(entrances);
                }
                cb(null, file);
            }
        }
    }

    return through.obj(transform);
};
