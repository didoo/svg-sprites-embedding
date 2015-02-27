/* jslint node: true */
/* jshint strict: false */

// ### PACKAGES ###
// ---------------------------------------
var gulp        = require('gulp'),
    svgsprite   = require('gulp-svg-sprite'),
    svgmin      = require('gulp-svgmin'),
    svgo        = require('imagemin-svgo'),
    cheerio     = require('gulp-cheerio'),
    inject      = require('gulp-inject'),
    rename      = require('gulp-rename'),
    del         = require('del'),
    filter      = require('gulp-filter'),
    gutil       = require('gulp-util'),
    filelog     = require('gulp-filelog'), // use: .pipe(filelog())
    using       = require('gulp-using'),   // use: .pipe(using({ prefix:'Using', color:'white' }))
    debug       = require('gulp-debug');   // use: .pipe(debug())


// ############################################################################################################

gulp.task('svgsprite', ['clean:svgsprite'], function() {

    var is_mono = filter('**/add.svg');

    return gulp.src('source/**/*.svg')
        .pipe(is_mono)
            .pipe(using({ prefix:'Using filtered sprite', color:'white' }))
            .pipe(cheerio({
                run: function ($) {
                    $('[fill]').removeAttr('fill').attr('fill','currentColor');
                },
                parserOptions: { xmlMode: true }
            }))
        .pipe(is_mono.restore())
        // .pipe(svgmin({ plugins: [{removeUselessStrokeAndFill:false},{removeEditorsNSData:true},{removeTitle:true},{removeDesc:true}] }))
        .pipe(svgo({ plugins: [{removeUselessStrokeAndFill:false},{removeEditorsNSData:true},{removeTitle:true},{removeDesc:true}] })())
        .pipe(svgsprite({
            shape : { spacing : { padding : 0 }},
            mode : { symbol : { dest : '.', sprite : 'sprite.svg' } },
        }))
        .pipe(gulp.dest('output/svgsprite'));

});
gulp.task('clean:svgsprite', function(cb) {
    del('output/svgsprite/**', cb);
});

// ############################################################################################################

gulp.task('inline', function () {

    var is_mono = filter('**/add.svg');

    var svgpipe = gulp.src('source/**/*.svg')
        .pipe(is_mono)
            .pipe(using({ prefix:'Using filtered inline', color:'white' }))
            .pipe(cheerio({
                run: function ($) {
                    $('[fill]').removeAttr('fill'); //.attr('fill','currentColor');
                },
                parserOptions: { xmlMode: true }
            }))
        .pipe(is_mono.restore())
        // .pipe(svgmin({ plugins: [{removeUselessStrokeAndFill:false},{removeEditorsNSData:true},{removeTitle:true},{removeDesc:true}] }))
        .pipe(svgo({ plugins: [{removeUselessStrokeAndFill:false},{removeEditorsNSData:true},{removeTitle:true},{removeDesc:true}] })())
        .pipe(svgsprite({
            shape : { spacing : { padding : 0 }},
            mode : { symbol : { dest : '.', sprite : 'sprite-inlineable.svg', inline: true } },
        }))
        // .pipe(cheerio({
        //     run: function ($) {
        //         $('svg').attr('style', 'display:none');
        //     },
        //     parserOptions: { xmlMode: true }
        // }))
        .pipe(gulp.dest('output/svgsprite'))
        ;

    // var svgfile = gulp.src('output/svgsprite-inline/symbol/svg/sprite.symbol.svg', {read: true});
    var svgfile = gulp.src('output/svgsprite/sprite-inlineable.svg', {read: true});

    return gulp.src('test-inline.html')
        .pipe(inject(svgfile, { transform: function (filePath, file) { return file.contents.toString('utf8'); } }))
        .pipe(gulp.dest('.'));
});

// ############################################################################################################

// The default task = used for development
gulp.task('default', ['svgsprite', 'inline']);

