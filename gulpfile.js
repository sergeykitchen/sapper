const gulp = require('gulp');
const sass = require('gulp-sass');
const browserSync = require('browser-sync');
const babel = require('gulp-babel');


// компиляция sass
gulp.task('sass', () => {
  return gulp.src('app/styles/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// живая перезагрузка
gulp.task('browserSync', () => {
  browserSync({
    server: {
      baseDir: 'app'
    },
  })
});

// babel
gulp.task('babel', () => {
  gulp.src('app/scripts/*.js')
    .pipe(babel({
      presets: ['env']
    }))
    .pipe(gulp.dest('dist'))
});

// слежение за файлами
gulp.task('watch', ['browserSync', 'sass'], () => {
  gulp.watch('app/styles/*.scss', ['sass']);
  gulp.watch('app/*.html', browserSync.reload);
  gulp.watch('app/scripts/*.js', browserSync.reload);
});

// имя по-умолчанию
gulp.task('default', ['watch', 'babel']);
