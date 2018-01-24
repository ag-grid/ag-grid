/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

'use strict';

/* eslint-env node */
/* eslint-disable no-console */

const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const buffer = require('vinyl-buffer');
const rename = require('gulp-rename');
const rollup = require('rollup-stream');
const source = require('vinyl-source-stream');
const del = require('del');
const bower = require('bower');
const runseq = require('run-sequence');
const closure = require('google-closure-compiler').gulp();
const babel = require('rollup-plugin-babel');

function debugify(sourceName, fileName, extraRollupOptions) {
  if (!fileName)
    fileName = sourceName;

  const options = {
    entry: `./entrypoints/${sourceName}-index.js`,
    format: 'iife',
    moduleName: 'webcomponentsjs'
  };

  Object.assign(options, extraRollupOptions);

  return rollup(options)
  .pipe(source(`${sourceName}-index.js`), 'entrypoints')
  .pipe(rename(fileName + '.js'))
  .pipe(gulp.dest('./'))
}

function closurify(sourceName, fileName) {
  if (!fileName) {
    fileName = sourceName;
  }

  const closureOptions = {
    new_type_inf: true,
    compilation_level: 'ADVANCED',
    language_in: 'ES6_STRICT',
    language_out: 'ES5_STRICT',
    isolation_mode: 'IIFE',
    assume_function_wrapper: true,
    js_output_file: `${fileName}.js`,
    warning_level: 'VERBOSE',
    rewrite_polyfills: false,
    externs: [
      'externs/webcomponents.js',
      'bower_components/custom-elements/externs/custom-elements.js',
      'bower_components/html-imports/externs/html-imports.js',
      'bower_components/shadycss/externs/shadycss-externs.js',
      'bower_components/shadydom/externs/shadydom.js'
    ]
  };

  const rollupOptions = {
    entry: `entrypoints/${sourceName}-index.js`,
    format: 'iife',
    moduleName: 'webcomponents',
    sourceMap: true,
    context: 'window'
  };

  return rollup(rollupOptions)
  .pipe(source(`${sourceName}-index.js`, 'entrypoints'))
  .pipe(buffer())
  .pipe(sourcemaps.init({loadMaps: true}))
  .pipe(closure(closureOptions))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('.'));
}

gulp.task('debugify-hi', () => {
  return debugify('webcomponents-hi')
});

gulp.task('debugify-hi-ce', () => {
  return debugify('webcomponents-hi-ce')
});

gulp.task('debugify-hi-sd-ce', () => {
  return debugify('webcomponents-hi-sd-ce')
});

gulp.task('debugify-hi-sd-ce-pf', () => {
  // The es6-promise polyfill needs to set the correct context.
  // See https://github.com/rollup/rollup/wiki/Troubleshooting#this-is-undefined
  const extraOptions = {context: 'window'};
  return debugify('webcomponents-hi-sd-ce-pf', 'webcomponents-lite', extraOptions)
});

gulp.task('debugify-sd-ce', () => {
  return debugify('webcomponents-sd-ce')
});

gulp.task('closurify-hi', () => {
  return closurify('webcomponents-hi')
});

gulp.task('closurify-hi-ce', () => {
  return closurify('webcomponents-hi-ce')
});

gulp.task('closurify-hi-sd-ce', () => {
  return closurify('webcomponents-hi-sd-ce')
});

gulp.task('closurify-hi-sd-ce-pf', () => {
  return closurify('webcomponents-hi-sd-ce-pf', 'webcomponents-lite')
});

gulp.task('closurify-sd-ce', () => {
  return closurify('webcomponents-sd-ce')
});

function singleLicenseComment() {
  let hasLicense = false;
  return (comment) => {
    if (hasLicense) {
      return false;
    }
    return hasLicense = /@license/.test(comment);
  }
}

const babelOptions = {
  presets: 'babili',
  shouldPrintComment: singleLicenseComment()
};

gulp.task('debugify-ce-es5-adapter', () => {
  return debugify('custom-elements-es5-adapter', '', {plugins: [babel(babelOptions)]});
});

gulp.task('refresh-bower', () => {
  return del('bower_components').then(() => {
    return new Promise((resolve, reject) => {
      bower.commands.install().on('end', () => resolve()).on('error', (e) => reject(e));
    });
  });
});

gulp.task('default', (cb) => {
  runseq('refresh-bower', 'closure', cb);
});

gulp.task('clean-builds', () => {
  return del(['custom-elements-es5-adapter.js{,.map}', 'webcomponents*.js{,.map}', '!webcomponents-loader.js']);
});

gulp.task('debug', (cb) => {
  const tasks = [
    'debugify-hi',
    'debugify-hi-ce',
    'debugify-hi-sd-ce',
    'debugify-hi-sd-ce-pf',
    'debugify-sd-ce',
    'debugify-ce-es5-adapter'
  ];
  runseq('clean-builds', tasks, cb);
});

gulp.task('closure', (cb) => {
  const tasks = [
    'closurify-hi',
    'closurify-hi-ce',
    'closurify-hi-sd-ce',
    'closurify-hi-sd-ce-pf',
    'closurify-sd-ce',
    'debugify-ce-es5-adapter'
  ];
  runseq('clean-builds', ...tasks, cb);
});