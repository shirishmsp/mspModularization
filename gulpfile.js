const gulp = require('gulp');
const concat = require('gulp-concat');
const wrap = require('gulp-wrap-amd');
const sourcemaps = require('gulp-sourcemaps');
const replace = require('gulp-replace');
const uglify = require('gulp-uglify');

gulp.task('componentsBundler', function() {
	return gulp.src(['components/**/*.js'])
		.pipe(sourcemaps.init())
		.pipe(concat('all-non-module-components.js'))
		// .pipe(uglify())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('dist'))
})

gulp.task('wrapAMD', function() {
	return gulp.src(['dist/all-non-module-components.js'])
		.pipe(wrap({
			deps: ['modules-bundle'],
			params: 'Modules'
		}))
		.pipe(replace(/return/, function(match, p1, offset, string) {
			// Remove the first return statement added by `wrap()`.
			return '';
		}))
		.pipe(gulp.dest('dist'))
})

gulp.task('default', gulp.series('componentsBundler', 'wrapAMD'))