"use strict";

const gulp = require("gulp");
const del = require('del');
const concat = require('gulp-concat');

const src = "src"
const dest = "dist";
const ffext_dir = `ffextension`;
const chrome_dir = `chrome_ext`;
const bookmarklet_name = "pagezipper_10.js";
const ext_name = "pagezipper.js"

var isProd = false

const jsFiles = [
                    "header.js",
                    "lib/jquery.js",
                    "pagezipper.js",
                    "compat.js",
                    "image.js",
                    "lib/jstoolkit.js",
                    "lib/levenshtein.js",
                    "menu.js",
                    "nextlink.js",
                    "next_url_trials.js",
                    "next_url.js",
                    "page_loader_ajax.js",
                    "page_loader_iframe.js",
                    "page_loader.js",
                    "util.js",
                  ];

function build_pgzp(output_name, loader_file, destLoc) {
  var currJsFiles = jsFiles.map( f => { return `${src}/${f}` });
  currJsFiles.push(loader_file);
  gulp.src(currJsFiles)
    .pipe(gulp.dest(destLoc));
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
  let loader_file = `${src}/loader_bookmarklet.js`;
  build_pgzp(bookmarklet_name, loader_file, dest);
});

gulp.task('make_chrome_ext', [], () => {
  copy_ext_files(chrome_dir);
  build_pgzp(ext_name, `${src}/loader_chrome.js`, `${dest}/${chrome_dir}`);
});

gulp.task('make_ff_ext', [], () => {
  // jQuery must be included separately for the FF reviewers
  // also the FF reviewers don't want the source to be compressed
  // :(

  // copy over assets, common files
  copy_ext_files(ffext_dir)

  // remove jquery from src files, and copy it over
  var jq = jsFiles.splice(1,1)[0];
  gulp.src(`${src}/${jq}`).pipe(gulp.dest(`${dest}/${ffext_dir}/`));

  // no compression for FF
  isProd = false;
  build_pgzp(ext_name, `${src}/loader_firefox.js`, `${dest}/${ffext_dir}`);
});

gulp.task('build', ['clean', 'make_bookmarklet', 'make_chrome_ext', 'make_ff_ext'], () => {
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