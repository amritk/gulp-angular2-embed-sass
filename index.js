var through        = require('through2');
var gutil          = require('gulp-util');
var pathModule     = require('path');
var sass           = require('node-sass');
var fs             = require('fs');
var jsStringEscape = require('js-string-escape');
var PluginError    = gutil.PluginError;


// Constants
const PLUGIN_NAME = 'gulp-angular2-embed-sass';

module.exports = function (options) {

    options = options || {};

    var content;
    var styleUrlRegexp =  /styleUrls[\'"\s]*:[\s]*\[(.*)\]/;

    const FOUND_SUCCESS = {};
    const FOUND_ERROR = {};
    const FOUND_IGNORE = {};
    const CODE_EXIT = {};

    const TEMPLATE_BEGIN = Buffer('styles: [\'');
    const TEMPLATE_END = Buffer('\']');

    var debug = true;
    function log() {
        if (debug) {
            console.log.apply(console, arguments);
        }
    }

    /**
     * Find next "styleUrls:", and try to replace url with content if template available, less then maximum size.
     * And finally (in any case) call 'cb' function with proper code
     *
     * @param {String} filePath path to original .js file
     * @param {Function} cb callback function to call when
     */
    function replace(filePath, cb, relativeSassPath, matches, done) {

        var path = pathModule.join(filePath, relativeSassPath);

        sass.render({
          file: path,
        }, function(err, result) {

            if (err) {
                cb(FOUND_ERROR, 'Error while compiling sass template "' + path + '". Error from "node-sass" plugin: ' + err);
            }

            cb(FOUND_SUCCESS, {
                regexpMatch : matches,
                template: result.css.toString()
            });

            if(done) cb(CODE_EXIT);
        });
    }

    function joinParts(entrances) {
        var parts = [];
        var index = 0;
        var matches = entrances[0].regexpMatch;

        parts.push(Buffer(content.substring(index, matches.index)));
        parts.push(TEMPLATE_BEGIN);

        for (var i=0; i<entrances.length; i++) {

            parts.push(Buffer(entrances[i].template.replace(/\n/g, '')));

            if (i < entrances.length - 1) {
                parts.push(Buffer('\', \''));
            }

        }
        parts.push(TEMPLATE_END);
        index = matches.index + matches[0].length;
        parts.push(Buffer(content.substr(index)));
        return Buffer.concat(parts);
    }

    function transform(file, enc, cb) {

        // ignore empty files
        if (file.isNull()) {
            cb(null, file);
            return;
        }

        if (file.isStream()) {
            throw new PluginError(PLUGIN_NAME, 'Streaming not supported. particular file: ' + file.path);
        }

        var pipe = this;
        content = file.contents.toString('utf-8');
        var entrances = [];

        log('\nfile.path: ' + file.path);

        var base = options.basePath ? options.basePath : pathModule.dirname(file.path);
        var matches = styleUrlRegexp.exec(content);

        log('matches: ' + matches[1]);

        if (matches === null) {
            replaceCallback(CODE_EXIT);
            return;
        }

        var relativeTemplatePaths = matches[1].replace(/[\ '"]/g,"").split(',');
        var entrances = [];

        for (var i = 0; i < relativeTemplatePaths.length; i++) {
            replace(base, replaceCallback, relativeTemplatePaths[i], matches, i === relativeTemplatePaths.length - 1);
        }


        function replaceCallback(code, data) {

            if (code === FOUND_SUCCESS) {
                entrances.push(data);
            }

            else if (code === FOUND_ERROR) {
                var msg = data;

                if (options.skipErrors) {
                    gutil.log(
                        PLUGIN_NAME,
                        gutil.colors.yellow('[Warning]'),
                        gutil.colors.magenta(msg)
                    );
                    replace(base, replaceCallback);
                } else {
                    pipe.emit('error', new PluginError(PLUGIN_NAME, msg));
                }
            }

            else if (code === FOUND_IGNORE) {
                gutil.log(
                    PLUGIN_NAME,
                    gutil.colors.yellow('[Template ignored]'),
                    gutil.colors.blue(data.path),
                    'maximum size reached',
                    gutil.colors.magenta(data.size + ' bytes')
                );
                replace(base, replaceCallback);
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
