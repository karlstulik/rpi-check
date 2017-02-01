var gulp = require('gulp');
var nodemon = require('nodemon');

gulp.task('default', function () {

	var files = [
		'bower_components/angular/angular.min.js',
		'bower_components/socket.io-client/dist/socket.io.min.js',
		'bower_components/chart.js/dist/Chart.min.js',
		'bower_components/angular-chart.js/dist/angular-chart.min.js',
		'bower_components/underscore/underscore-min.js',
	];

	gulp.src(files).pipe(gulp.dest('public/js/'));

	nodemon({
		script: 'server.js',
		ext: 'js html',
		env: {
			'NODE_ENV': 'development'
		}
	});
});