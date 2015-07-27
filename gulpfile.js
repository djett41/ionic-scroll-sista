var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var sh = require('shelljs');
var karma = require('karma').server;
var uglify = require('gulp-uglify');

var karmaConf = require('./karma.conf.js');
var paths = {
  sass: ['./scss/**/*.scss'],
  js: ['js/**/*.js'],
  dist: './dist'
};

gulp.task('default', ['karma']);
gulp.task('dist', ['scripts']);

gulp.task('scripts', function() {
  return gulp.src(['js/ionic.scroll.sista.js'])
    .pipe(concat('ionic.scroll.sista.js'))
    .pipe(gulp.dest(paths.dist))
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest(paths.dist));
});

/*
gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
});*/

gulp.task('karma', function(done) {
  karmaConf.singleRun = true;
  karma.start(karmaConf, done);
});

gulp.task('karma-watch', function(done) {
  karmaConf.singleRun = false;
  karma.start(karmaConf, done);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});
