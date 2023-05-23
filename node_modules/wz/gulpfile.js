// generator: wizzi-lab-artifatcs/lib/js/module/gen/main.js, utc time: Thu, 22 Oct 2015 21:00:41 GMT
var gulp = require('gulp');
var mocha = require('gulp-mocha');
gulp.task('test', function() {
    gulp.src('tests/**/*.js').pipe(mocha({
        reporter: 'spec', 
        clearRequireCache: true, 
        ignoreLeaks: true
    }));
});
gulp.task('default', [
    'test'
]);
