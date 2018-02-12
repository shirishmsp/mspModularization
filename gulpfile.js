const gulp = require('gulp');
const concat = require('gulp-concat');
const wrap = require('gulp-wrap-amd');
const sourcemaps = require('gulp-sourcemaps');

gulp.task('componentsBundler', function() {
	return gulp.src(['components/**/*.js'])
		.pipe(sourcemaps.init())
		.pipe(concat('all-non-module-components.js'))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('dist'))
})

gulp.task('wrapAMD', function() {
	return gulp.src(['dist/all-non-module-components.js'])
		.pipe(wrap({
			deps: ['modules-bundle'],
			params: 'Modules'
		}))
		.pipe(gulp.dest('dist'))
})

gulp.task('default', gulp.series('componentsBundler', 'wrapAMD'))