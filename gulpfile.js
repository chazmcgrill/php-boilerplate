const gulp = require("gulp");
const uglify = require("gulp-uglify-es").default;
const browserSync = require('browser-sync').create();
const plugs = require('gulp-load-plugins')({lazy: false});
const php = require('gulp-connect-php');

// -- FILE PATHS

const paths = {
  sass: {
    src: 'src/css/**/*.sass',
    dist: 'dist/assets/css'
  },
  php: {
    watch: '**/*.php'
  },
  js: {
    src: 'src/js/**/*.js',
    dist: 'dist/assets/js'
  },
  img: {
    src: 'src/img/*',
    dist: 'dist/assets/img'
  }  
}


// -- FILE TASKS

gulp.task('sass', () => {
  return gulp.src(paths.sass.src)
    .pipe(plugs.sass().on('error', plugs.sass.logError))
    .pipe(gulp.dest(paths.sass.dist));
});

gulp.task('scripts', () => {
  return gulp.src(paths.js.src)
    .pipe(plugs.babel({ presets: ['env'] }))
    .pipe(uglify())
    .pipe(plugs.concat('app.js'))
    .pipe(gulp.dest(paths.js.dist));
});

gulp.task('imageMin', () => {
  return gulp.src(paths.img.src)
    .pipe(plugs.imagemin([plugs.imagemin.jpegtran({ progressive: true })]))
    .pipe(gulp.dest(paths.img.dist))
});


// -- MAIN TASKS

gulp.task('watch', () => {
  gulp.watch(paths.js.src, gulp.series("scripts"));
  gulp.watch(paths.img.src, gulp.series("imageMin"));
  gulp.watch(paths.sass.src, gulp.series("sass"));
});

gulp.task('php', () => {
  return php.server();
});

gulp.task('browser-sync', () => {
  php.server({}, () => {
    browserSync.init({
      proxy: '127.0.0.1:8000'
    });
  });

  gulp.watch('**/*.php').on('change', () => {
    browserSync.reload();
  });
});

const build = gulp.series('sass', 'php', 'scripts', 'imageMin', 'browser-sync');

gulp.task('default', gulp.parallel(build, gulp.series(gulp.parallel('browser-sync', 'watch'))));
gulp.task('prod', gulp.parallel(build));
