var through = require('through2');
var gutil = require('gulp-util');
var pathModule = require('path');
// var jsStringEscape = require('js-string-escape');
// var fs = require('fs');
// var PluginError = gutil.PluginError;

// Constants
const PLUGIN_NAME = 'gulp-angular2-embed-sass';

module.exports = function (options) {

    options = options || {};

    const TEMPLATE_URL_PATTERN = '[\'"]?styleUrls[\'"]?[\\s]*:[\\s]*[\'"]([^\'"]+)[\'"]';

    var content;
    var styleUrlRegexp;

    const FOUND_SUCCESS = {};
    const FOUND_ERROR = {};
    const FOUND_IGNORE = {};
    const CODE_EXIT = {};

    const TEMPLATE_BEGIN = Buffer('style:\'');
    const TEMPLATE_END = Buffer('\'');

    /**
     * Find next "styleUrls:", and try to replace url with content if template available, less then maximum size.
     * And finally (in any case) call 'cb' function with proper code
     *
     * @param {String} filePath path to original .js file
     * @param {Function} cb callback function to call when
     */
    function replace(filePath, cb) {
        console.log(content);
        var matches = styleUrlRegexp.exec(content);

        console.log('matches: ' + matches);

        if (matches === null) {
            cb(CODE_EXIT);
            return;
        }

        var relativeTemplatePath = matches[1];
        var path = pathModule.join(filePath, relativeTemplatePath);

        console.log('template path: ' + path);

        if (options.maxSize) {
            var fileStats = fs.statSync(path);
            if (fileStats && fileStats.size > options.maxSize) {
                return cb(FOUND_IGNORE, {
                    path: relativeTemplatePath,
                    size: fileStats.size
                });
            }
        }

        fs.readFile(path, {encoding: options.templateEncoding}, function(err, templateContent) {
            if (err) {
                cb(FOUND_ERROR, 'Can\'t read template file: "' + path + '". Error details: ' + err);
                return;
            }

            minimizer.parse(templateContent, function (err, minifiedContent) {
                if (err) {
                    cb(FOUND_ERROR, 'Error while minifying angular template "' + path + '". Error from "minimize" plugin: ' + err);
                    return;
                }

                cb(FOUND_SUCCESS, {
                    regexpMatch : matches,
                    template: minifiedContent
                });
            });
        });
    }

    function joinParts(entrances) {
        var parts = [];
        var index = 0;
        for (var i=0; i<entrances.length; i++) {
            var entrance = entrances[i];
            var matches = entrance.regexpMatch;

            parts.push(Buffer(content.substring(index, matches.index)));
            parts.push(TEMPLATE_BEGIN);
            parts.push(Buffer(jsStringEscape(entrance.template)));
            parts.push(TEMPLATE_END);

            index = matches.index + matches[0].length;
        }
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
        styleUrlRegexp = new RegExp(TEMPLATE_URL_PATTERN, 'g');
        var entrances = [];

        console.log('\nfile.path: ' + file.path);

        var base = options.basePath ? options.basePath : pathModule.dirname(file.path);
        replace(base, replaceCallback);

        function replaceCallback(code, data) {
            if (code === FOUND_SUCCESS) {
                entrances.push(data);
                replace(base, replaceCallback);
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
