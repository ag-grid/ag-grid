const gulp = require('gulp');
const {series, parallel} = gulp;
const sourcemaps = require('gulp-sourcemaps');
const clean = require('gulp-clean');
const gulpTypescript = require('gulp-typescript');
const typescript = require('typescript');
const gulpif = require('gulp-if');
const header = require('gulp-header');
const merge = require('merge2');
const pkg = require('./package.json');
const replace = require('gulp-replace');
const rename = require('gulp-rename');

const headerTemplate = ['/**',
    ' * <%= pkg.name %> - <%= pkg.description %>',
    ' * @version v<%= pkg.version %>',
    ' * @link <%= pkg.homepage %>',
    ' * @license <%= pkg.license %>',
    ' */',
    ''].join('\n');

const dtsHeaderTemplate =
    '// Type definitions for <%= pkg.name %> v<%= pkg.version %>\n' +
    '// Project: <%= pkg.homepage %>\n' +
    '// Definitions by: Niall Crosby <https://github.com/ag-grid/>\n';

// Start of Typescript related tasks
const cleanDist = () => {
    return gulp
        .src('dist', {read: false, allowEmpty: true})
        .pipe(clean());
};

const tscTask = async (tsConfigFile, destination, sourceMaps, mjsProcessing = false) => {
    await new Promise((resolve, reject) => {
        const tsProject = gulpTypescript.createProject(tsConfigFile, {typescript: typescript});

        const tsResult = gulp
            .src(['src/ts/**/*.ts', '!src/ts/**/*.test.ts', '!src/ts/test-utils/mock.ts'])
            .pipe(gulpif(sourceMaps, sourcemaps.init()))
            .pipe(tsProject());

        let stream = null;
        // let stream = tsResult.js.pipe(header(headerTemplate, {pkg: pkg}));
        if (mjsProcessing) {
            stream = tsResult.js
                .pipe(replace(/(import|export)(.*['"]\..*)(['"].*)/gi, (line) => {
                    if (line.startsWith("import") && (line.endsWith('./utils";') || line.endsWith('./utils\';'))) {
                        return line.replace('./utils', './utils/index.mjs');
                    }

                    const regexp = /(import|export)(.*['"]\..*)(['"].*)/gi;
                    const matches = [...line.matchAll(regexp)][0];
                    return `${matches[1]}${matches[2]}.mjs${matches[3]}`
                }))
                .pipe(rename((path) => {
                    let {extname} = path;
                    if (extname === '.js') {
                        path.extname = extname.replace('.js', '.mjs')
                    }
                    return path;
                }))
        }
        stream = (stream ? stream : tsResult.js).pipe(gulpif(sourceMaps, sourcemaps.write('.')))
            .pipe(gulp.dest(destination));


        merge([
            tsResult.dts
                .pipe(header(dtsHeaderTemplate, {pkg: pkg}))
                .pipe(gulp.dest(destination)), stream])
            .on('finish', resolve)
            .on('error', reject)
    })
}

const addHeader = async (sourceDir, mjsProcessing) => {
    await new Promise((resolve, reject) => {
        gulp.src([`${sourceDir}/main.${mjsProcessing ? 'mjs' : 'js'}`])
            .pipe(header(headerTemplate, {pkg: pkg}))
            .pipe(gulp.dest(sourceDir))
            .on('finish', resolve)
            .on('error', reject)
    });
}

const tscWithHeader = async (config, dir, sourceMaps, mjsProcessing = false) => {
    await tscTask(config, dir, sourceMaps, mjsProcessing);
    await addHeader(dir, mjsProcessing);
}

const tscSrcCjsEs5Task = async (done) => {
    await tscWithHeader('tsconfig.cjs.es5.json', 'dist/cjs/es5', true);
    done();
};

const tscSrcCjsEs6Task = async (done) => {
    await tscWithHeader('tsconfig.cjs.es6.json', 'dist/cjs/es6', true);
    done();
};

const tscSrcEsModulesEs6Task = async (done) => {
    await tscWithHeader('tsconfig.esm.es6.json', 'dist/esm/es6', true, true);
    done();
};

const tscSrcEsModulesEs5Task = async (done) => {
    await tscWithHeader('tsconfig.esm.es5.json', 'dist/esm/es5', true);
    done();
};

const tscSrcCjsEs5ProdTask = async (done) => {
    await tscWithHeader('tsconfig.cjs.es5.json', 'dist/cjs/es5', false);
    done();
};

const tscSrcCjsEs6ProdTask = async (done) => {
    await tscWithHeader('tsconfig.cjs.es6.json', 'dist/cjs/es6', false);
    done();
};

const tscSrcEsModulesEs6ProdTask = async (done) => {
    await tscWithHeader('tsconfig.esm.es6.json', 'dist/esm/es6', false, true);
    done();
};

const tscSrcEsModulesEs5ProdTask = async (done) => {
    await tscWithHeader('tsconfig.esm.es5.json', 'dist/esm/es5', false);
    done();
};

const watch = () => {
    return gulp.watch(['./src/ts/**/*.ts'], tscSrcEsModulesEs5Task);
};

const watchAndBuildBoth = () => {
    return gulp.watch(['./src/ts/**/*.ts'], parallel[tscSrcCjsEs5Task, tscSrcEsModulesEs5Task]);
};

// End of Typescript related tasks

// Typescript related tasks
gulp.task('clean', cleanDist);
gulp.task('tsc-no-clean-cjs', parallel(tscSrcCjsEs5Task, tscSrcCjsEs6Task));
gulp.task('tsc-no-clean-esm', parallel(tscSrcEsModulesEs5Task, tscSrcEsModulesEs6Task));
gulp.task('tsc-no-clean-cjs-prod', parallel(tscSrcCjsEs5ProdTask, tscSrcCjsEs6ProdTask));
gulp.task('tsc-no-clean-esm-prod', parallel(tscSrcEsModulesEs5ProdTask, tscSrcEsModulesEs6ProdTask));
gulp.task('tsc-no-clean', parallel('tsc-no-clean-cjs', 'tsc-no-clean-esm'));
gulp.task('tsc-no-clean-prod', parallel('tsc-no-clean-cjs-prod', 'tsc-no-clean-esm-prod'));
gulp.task('tsc', series('clean', 'tsc-no-clean'));

// tsc related tasks
gulp.task('tsc-es6-watch', series('tsc-no-clean-esm', watch));
gulp.task('tsc-watch', series('tsc-no-clean', watchAndBuildBoth));
gulp.task('tsc-clean', series('clean', 'tsc-no-clean'));
gulp.task('tsc-clean-prod', parallel('clean', 'tsc-no-clean-prod'));
gulp.task('tsc-no-clean', parallel('tsc-no-clean'));

// default/release task
gulp.task('default', series('tsc-clean'));
gulp.task('prod', series('tsc-clean-prod'));


