# gulp-angular2-embed-sass [![Build Status](https://travis-ci.org/amritk/gulp-angular2-embed-sass.svg?branch=master)](https://travis-ci.org/amritk/gulp-angular2-embed-sass)
A gulp plugin to compile styleUrls with sass to css and include them as strings under style.

*I have switched to Vue.js now, I will still merge pull requests but someone can take over this plugin if they wish.

## Install
```
npm i gulp-angular2-embed-sass --save-dev
````
## Example
In your gulpfile.js:
```
var gulp      = require('gulp');
var embedSass = require('gulp-angular2-embed-sass');

gulp.task('embedSass', function() {
    gulp.src('targetPath')
        .pipe(embedSass())
        .pipe(gulp.dest('destinationPath'));
});
```
## Acknowledgements
Inspired by https://github.com/laxa1986/gulp-angular-embed-templates

## Licence
This module is released under the MIT license.
