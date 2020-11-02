//constants
const { src, dest, parallel, series, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const scss = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const del = require('del');
const newer = require('gulp-newer');


let prep = 'scss';


//functions
function browsersync() //server 
{
    browserSync.init
    ({
        server: { baseDir: 'src/' }, 
        notyfy: false, //off notifications
        online: false //offline working
    })
}

function scripts()
{
    return src('src/js/script.js')
    .pipe(concat('script.min.js')) //concatination files
    .pipe(uglify()) //compression
    .pipe(dest('src/js/')) //create stream for writing objects to the file system
    .pipe(browserSync.stream()) //live update with hard reload cuz scripts
}

function styles()
{
    return src
    ([
        'src/' + prep + '/main.scss', 
        'src/' + prep + '/reset.scss',
    ])
    .pipe(eval(prep)()) //field as function
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer({ overrideBrowsersList: ['last 7 versions'] })) //adding vendor prefixes
    .pipe(cleancss(( { level: { 1: {specialComments: 0 } }, /*format: 'beautify'*/ } ))) //beautify - more beatiful view
    .pipe(dest('src/css/'))   
    .pipe(browserSync.stream()) //updates
}

function startwatch()
{
    watch(['src/js/*.js', '!src/js/*.min.js'], scripts);
    watch('src/' + prep + '/*', styles);
    watch('src/*.html').on('change', browserSync.reload);
    watch('src/images/**/*', images);
}

function images()
{
    return src('src/images/src/**/*') 
	.pipe(newer('src/images/dest/')) 
	.pipe(imagemin()) 
	.pipe(dest('src/images/dest/'))
}

function copy()
{
    return src([
        'src/css/**/*.min.css',
        'src/js/**/*.min.js',
        'src/images/**/*',
        'src/**/*.html'
    ], {base : 'src'})
    .pipe(dest('dist'))
}

function cleandist()
{
    return del('dist/**/*', {force: true} )
}

//exports to task
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.styles = styles;
exports.images = images;
exports.build = series(cleandist, styles, scripts, images, copy) //consistently
exports.cleandist = cleandist;

exports.default = parallel(styles, scripts, browsersync, startwatch)