/*global require */

(function () {
    'use strict';

    var gulp = require('gulp');
    var jslint = require('gulp-jslint');
    var beeper = require('beeper');

    var files = {
        js: 'app/js/*.js'
    };

    var tasks = {
        watch: 'watch',
        lint: 'lint'
    };

    var lintFiles = [files.js, 'Gulpfile.js'];

    gulp.task(tasks.lint, function () {
        return gulp.src(lintFiles)
            .pipe(jslint({edition: 'es6'}))
            .pipe(jslint.reporter('stylish'))
            .pipe(jslint.reporter(function (results) {
                if (results.errors.length > 0) {
                    beeper(3);
                }
            }));
    });

    gulp.task(tasks.watch, [tasks.lint], function () {
        gulp.watch(lintFiles, [tasks.lint]);
    });

    gulp.task('default', [tasks.watch]);
}());
