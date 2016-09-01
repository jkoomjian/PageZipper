"use strict";

const gulp = require("gulp");
const del = require('del');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const gulpIf = require('gulp-if');
const babel = require('gulp-babel');

const src = "src"
const dest = "dist";
const ffext_dir = `ffextension`;
const chrome_dir = `chrome_ext`;
const bookmarklet_name = "pagezipper_10.js";
const ext_name = "pagezipper.js"

var isProd = false

const srcs = {
              headers: ["header.js"],
              libs: [
                  "lib/jquery.js",
                  "lib/jstoolkit.js",
                  "lib/levenshtein.js",
              ],
              pgzp_srcs: [
                "pagezipper.js",
                "compat.js",
                "image.js",
                "menu.js",
                "nextlink.js",
                "next_url_trials.js",
                "next_url.js",
                "page_loader_ajax.js",
                "page_loader_iframe.js",
                "page_loader.js",
                "util.js",
              ]
};

function build_pgzp(output_name, loader_file, destLoc, isProd=false, skipJq=false) {

  // prepend 'src/' to filepaths
  ['headers', 'libs', 'pgzp_srcs'].forEach( jsFileArray => {
    global[`curr_${jsFileArray}`] = srcs[jsFileArray].map( f => { return `${src}/${f}` });
  });

  curr_pgzp_srcs.push(loader_file);

  if (skipJq) curr_libs.splice(0, 1);
  var allJsFiles = curr_headers.concat(curr_libs).concat([`${destLoc}/${output_name}`]);

  //compile pgzp src files
  gulp.src(curr_pgzp_srcs)
    .pipe(concat(output_name, {newLine: '\n\n'}))
    .pipe(babel( {presets: ['es2015']} ))
    .pipe(gulpIf(isProd, uglify()))
    .pipe(gulp.dest(destLoc))
    .on('end', function() {

        // combine headers, libs, and compiled srcs
        gulp.src(allJsFiles)
          .pipe(concat(output_name, {newLine: '\n\n'}))
          .pipe(gulp.dest(destLoc));
    });
}

function copy_ext_files(ext_dir) {
  gulp.src(`${src}/${ext_dir}/*`)
    .pipe(gulp.dest(`${dest}/${ext_dir}`));
  gulp.src(`${src}/extension_*/**`)
    .pipe(gulp.dest(`${dest}/${ext_dir}`));
}

gulp.task('clean', [], () => {
  var deleted = del.sync([`${dest}/*`]);
  console.log(`deleted ${deleted.join(', ')}`);
});

gulp.task('make_bookmarklet', [], () => {
  var loader_file = `${src}/loader_bookmarklet.js`;
  build_pgzp(bookmarklet_name, loader_file, dest, isProd);
});

gulp.task('make_chrome_ext', [], () => {
  copy_ext_files(chrome_dir);
  build_pgzp(ext_name, `${src}/loader_chrome.js`, `${dest}/${chrome_dir}`, isProd);
});

gulp.task('make_ff_ext', [], () => {
  // jQuery must be included separately for the FF reviewers
  // also the FF reviewers don't want the source to be compressed
  // :(

  // copy over assets, common files
  copy_ext_files(ffext_dir)

  // copy jQuery over
  var jq = srcs.libs[0];
  gulp.src(`${src}/${jq}`).pipe(gulp.dest(`${dest}/${ffext_dir}/`));

  // no compression for FF, remove jQuery
  build_pgzp(ext_name, `${src}/loader_firefox.js`, `${dest}/${ffext_dir}`, false, true);
});

gulp.task('build', ['clean', 'make_bookmarklet', 'make_chrome_ext', 'make_ff_ext'], () => {
});

gulp.task('watch', () => {
  gulp.watch(['src/**.js', 'src/**.html', 'src/**.css'], ['build']);
});

// Deploy to prod
gulp.task('prod', () => {
  isProd = true;
  gulp.start('build');
  console.log("Built Pgzp in production mode");
});

gulp.task('default', () => {
  gulp.start('build');
  console.log("Built Pgzp in development mode");
});