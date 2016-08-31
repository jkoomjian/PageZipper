"use strict";

const gulp = require("gulp");
const del = require('del');
const concat = require('gulp-concat');

const src = "src"
const dest = "dist";
const ext_icons = `${src}/extension_icons`;
const ffext_src = `${src}/ffextension`;
const chrome_src = `${src}/chrome_ext`;
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

function build_pgzp(output_name, loader_file) {
  var currJsFiles = jsFiles.map( f => { return `${src}/${f}` });
  currJsFiles.push(loader_file);

  gulp.src(currJsFiles)
    .pipe(concat(output_name))
    .pipe(gulp.dest(dest));
}


gulp.task('clean', [], () => {
  var deleted = del.sync([`${dest}/*`]);
  console.log(`deleted ${deleted.join(', ')}`);
});

gulp.task('make_bookmarklet', [], () => {
  let loader_file = `${src}/loader_bookmarklet.js`;
  return build_pgzp(bookmarklet_name, loader_file);
});

gulp.task('build', ['clean', 'make_bookmarklet'], () => {
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