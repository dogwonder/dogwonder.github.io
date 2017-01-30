var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var modernizr = require('gulp-modernizr');
var browserSync = require('browser-sync');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var pump = require('pump');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');
var cheerio = require("gulp-cheerio");
var svgstore = require('gulp-svgstore');
var svgmin = require('gulp-svgmin');
var path = require('path');
var banner = require('gulp-banner');
var plumber = require('gulp-plumber');
var gutil = require('gulp-util');
var pkg = require('./package.json');

var comment = '/*\n' +
    ' * Automatically Generated - DO NOT EDIT \n' +
    ' * Generated on <%= new Date().toISOString().substr(0, 19) %> \n' +
    ' * <%= pkg.name %> <%= pkg.version %>\n' +
    ' * <%= pkg.description %>\n' +
    ' * <%= pkg.homepage %>\n' +
    ' *\n' +
    ' * Copyright 2015, <%= pkg.author %>\n' +
    ' * Released under the <%= pkg.license %> license.\n' +
    '*/\n\n';




// Basic Gulp task syntax
gulp.task('hello', function() {
  console.log('Hello Zell!');
})

// Development Tasks
// -----------------

// Watchers
gulp.task('watch', function() {
  browserSync.init({
    files: ['{lib,templates}/**/*.php', '*.php'],
    proxy: "cyoa.dev",
    snippetOptions: {
      whitelist: ['/wp-admin/admin-ajax.php'],
      blacklist: ['/wp-admin/**']
    }
  });
  gulp.watch('app/scss/**/*.scss', ['sass']);
  gulp.watch('app/scripts/**/*.js', ['scripts'], browserSync.reload);
  gulp.watch('app/icons/*.svg', ['svgstore'], browserSync.reload);
})

// Banner
gulp.task('banner', function() {
    gulp.src([
      'dist/css/cyoa.css'
    ])
    .pipe(banner(comment, {
        pkg: pkg
    }))
    .pipe(gulp.dest('dist/css'));
});

gulp.task('sass', function() {
  return gulp
    .src('app/scss/*.scss')
    .pipe(plumber(function(error) {
      // Output an error message
      gutil.log(gutil.colors.red('Error (' + error.plugin + '): ' + error.message));
      // emit the end event, to properly end the task
      this.emit('end');
    })
    )
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/css')) // Outputs it in the css folder
    .pipe(browserSync.reload({ // Reloading with Browser Sync
      stream: true
    }));
})

gulp.task('sass-build', function () {
  return gulp
    .src('app/scss/*.scss')
    .pipe(plumber(function(error) {
      // Output an error message
      gutil.log(gutil.colors.red('Error (' + error.plugin + '): ' + error.message));
      // emit the end event, to properly end the task
      this.emit('end');
    })
    )
    .pipe(sass())
    .pipe(cssnano({
            autoprefixer: {browsers: ['> 1%', 'last 2 versions', 'Firefox >= 20']}
    }))
    .pipe(gulp.dest('dist/css'))
});


gulp.task('scripts', function (cb) {
  pump([
        gulp.src([
          'app/vendor/cyoa-master/dist/cyoa.min.js',
          'app/vendor/cyoa-master/js/tabletop.js',
          'app/scripts/scripts.js'
        ]),
        concat('cyoa.js'),
        uglify(),
        gulp.dest('dist/scripts')
    ],
    cb
  );
});

gulp.task('modernizr', function() {
  gulp.src('dist/scripts/**/*.js')
    .pipe(modernizr())
    .pipe(uglify())
    .pipe(gulp.dest("dist/scripts/modernizr"))
});


// Optimization Tasks
// ------------------

// Optimizing Images
gulp.task('images', function() {
  return gulp.src('app/images/**/*.+(png|jpg|jpeg|gif|svg)')
    // Caching images that ran through imagemin
    .pipe(cache(imagemin({
      interlaced: true,
    })))
    .pipe(gulp.dest('dist/images'))
});


// Copying icons
gulp.task('icons', function() {
  return gulp.src('app/icons/**/*')
    .pipe(gulp.dest('dist/icons'))
})

//SVGS
gulp.task("svgstore", function () {
    return gulp.src("app/icons/*.svg")
   .pipe(svgmin())
   .pipe(svgstore({
     inlineSvg: true,
    //  fileName: "sprite.svg",
     prefix: "icon-"
    }))
    .pipe(cheerio({
         run: function ($) {
           $("[fill]").removeAttr("fill");
    },
         parserOptions: { xmlMode: true }
    }))
   .pipe(gulp.dest("dist/icons"));
});

// Cleaning
gulp.task('clean', function() {
  return del.sync('dist').then(function(cb) {
    return cache.clearAll(cb);
  });
})

gulp.task('clean:dist', function() {
  return del.sync(['dist/**/*', '!dist/images', '!dist/images/**/*']);
});

// Build Sequences
// ---------------

gulp.task('default', function(callback) {
  runSequence(['sass', 'scripts', 'svgstore', 'browserSync', 'watch'],
    callback
  )
})

gulp.task('build', function(callback) {
  runSequence(
    'clean:dist',
    ['sass-build', 'scripts', 'modernizr', 'images', 'icons'],
    callback
  )
})
