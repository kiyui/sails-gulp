var gulp = require('gulp');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var minify = require('gulp-cssnano');
var del = require('del');
var forever = require('gulp-forever-monitor');

var paths = {
    'acss': './assets/styles/',
    'ajs': './assets/js/',
    'css': './.tmp/public/styles/',
    'js': './.tmp/public/js/',
    'jquery': './node_modules/jquery/',
}

gulp.task('clean', function() {
    return del([
        paths.fonts + '**/*',
        paths.css + 'app.css',
        paths.js + 'app.js'
    ]);
});

gulp.task('sass', function () {
    gulp.src(paths.acss + 'app.scss')
      .pipe(sass().on('error', sass.logError))
      .pipe(minify())
      .pipe(gulp.dest(paths.css));
});

gulp.task('scripts', function() {
    gulp.src([
        paths.jquery + "dist/jquery.js",
        paths.ajs + "app.js"
    ]).pipe(concat('app.js'))
      .pipe(uglify())
      .on('error', function() { console.log('Caught a JS error.'); })
      .pipe(gulp.dest(paths.js));
    gulp.src([
        paths.ajs + "dependencies/sails.io.js",
    ]).pipe(concat('sails.io.js'))
      .pipe(uglify())
      .on('error', function() { console.log('Caught a JS error.'); })
      .pipe(gulp.dest(paths.js + 'dependencies/'));
});

gulp.task('watch', function () {
    gulp.watch(paths.acss + 'app.scss', ['sass']);
    gulp.watch(paths.ajs + 'app.js', ['scripts']);
});

gulp.task('lift', function() {
    var options = { 
        env: process.env,
        args: process.argv,
        watch: true,
        watchIgnorePatterns:  ['.*', 'node_modules/**', '**/.tmp/**', '**/views/**']
    };

    forever('app.js', options)  
    .on('watch:restart', function(fileInfo) { 
        console.log('Restarting server');          
    })
    .on('exit', function() {
        console.log('Closing server');
    });
});

gulp.task('default', ['clean', 'sass', 'scripts']);

gulp.task('develop', ['clean', 'sass', 'scripts', 'watch', 'lift']);

