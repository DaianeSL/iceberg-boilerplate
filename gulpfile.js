"use strict";

var gulp        = require('gulp'),
    jade        = require('gulp-jade'),
    clean       = require('gulp-clean'),       
    stylus      = require('gulp-stylus'),
    jeet        = require('jeet'),
    rupture     = require('rupture'),
    koutoSwiss  = require('kouto-swiss'),
    prefixer    = require('autoprefixer-stylus'),
    uglify      = require('gulp-uglify'),
    concat      = require('gulp-concat'), 
    imagemin    = require('gulp-imagemin'),
    browserSync = require('browser-sync'),
    reload      = browserSync.reload,
    plumber     = require('gulp-plumber'),
    watch       = require('gulp-watch'), 
    batch       = require('gulp-batch'),       
    runSequence = require('run-sequence'),

    // Paths
    paths        = {
                    dev: "./src/",
                    dest: "./assets/",
                    bower: "./bower_components/"
                },
    srcPaths    = {
                    js: paths.dev + 'js/**/*.js',
                    css: paths.dev + 'styl/**/*.styl',
                    mainStyl: paths.dev + 'styl/main.styl',
                    jade: paths.dev + 'views/**/*.jade',
                    jadePages: paths.dev + 'views/pages/*.jade',
                    img: paths.dev + 'img/**/*.{jpg,png,gif,svg}'
                },
    buildPaths  = {
                    build: paths.dest + '**/*',
                    js: paths.dest + 'js/',
                    css: paths.dest + 'css/',
                    jade: './',
                    img: paths.dest + 'img'
                };



// Clean all 'dest' directory before generating the files
gulp.task('clean', function() {
    return gulp.src(paths.dest + '*')
            .pipe(clean());
});


// Jade Task 
gulp.task('jade', function() { 
    return gulp.src(srcPaths.jadePages)
        .pipe(plumber())
        .pipe(jade({
            client: false,
            pretty: true
        }))
        .pipe(gulp.dest(buildPaths.jade))
        .pipe(reload({stream: true}));
});


// CSS task
gulp.task('css', function() {
    return gulp.src(srcPaths.mainStyl)
            .pipe(plumber())
            .pipe(stylus({
                use:[koutoSwiss(), prefixer(), jeet(), rupture()],
                compress: true //--> minify css
            }))
            .pipe(gulp.dest(buildPaths.css))
            .pipe(browserSync.reload({stream:true}))
            .pipe(gulp.dest(buildPaths.css))
            .pipe(reload({stream: true}));
});


// Javascript Task
gulp.task('js', function() {
    return gulp.src(srcPaths.js)
            .pipe(plumber())
            .pipe(concat('main.js'))
            .pipe(uglify()) //--> minify js
            .pipe(gulp.dest(buildPaths.js))
            .pipe(reload({stream: true}));
});


// Img Task
gulp.task('img', function() {
    return gulp.src(srcPaths.img)
            .pipe(plumber())
            .pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true, cache: false }))
            .pipe(gulp.dest(buildPaths.img))
            .pipe(reload({stream: true}));
});


// Watch stylus files, js files, img files and jade files for changes and recompile
gulp.task('watch', function () {
    watch(srcPaths.css, batch(function(event, done){
        gulp.start('css', done);
    }));

    watch(srcPaths.js, batch(function(event, done){
        gulp.start('js', done);
    }));

    watch(srcPaths.img, batch(function(event, done){
        gulp.start('img', done);
    }));

    watch(srcPaths.jade, batch(function(event, done){
        gulp.start('jade', done);
    }));
});


// Wait for jade, then launch the Server
gulp.task('browser-sync', ['jade'], function() {    
    browserSync({
        server: {
            baseDir: './'
        }
    });
});


// Run Sequence allows you to perform the 'clean' task before others
// It also allows to ascertain the exact time of 'default' with callback
gulp.task('default', function(cb) {
    return runSequence('clean', ['jade', 'js', 'css', 'img', 'browser-sync', 'watch'], cb);
});

gulp.task('deploy', function(cb) {
    return runSequence('clean', ['jade', 'js', 'css', 'img'], cb);
});