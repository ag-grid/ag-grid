const fs = require('fs');
const gulp = require('gulp');
const {series} = require('gulp');
const gulpTypescript = require('gulp-typescript');
const header = require('gulp-header');
const pkg = require('./package.json');
const tsConfig = 'tsconfig.build.json';
const typescript = require('rollup-plugin-typescript');
const commonjs = require('rollup-plugin-commonjs');
const uglify = require('rollup-plugin-uglify').uglify;
const rollup = require('rollup-stream');
const source = require('vinyl-source-stream');
const clean = require('gulp-clean');
const link = require('lnk').sync;
const os = require('os');
const replace = require('gulp-replace');
const merge = require('merge-stream');

const WINDOWS = /^win/.test(os.platform());

const headerTemplate = '// <%= pkg.name %> v<%= pkg.version %>\n';

const cleanLib = () => {
    return gulp
        .src('lib', {read: false, allowEmpty: true})
        .pipe(clean());
};

tscTask = () => {
    const tscProject = gulpTypescript.createProject(tsConfig);
    const tsResult = gulp.src(
        [
            'src/**/*.ts*',
            '!src/**/old/**/*',
            '!src/**/__tests__/**/*',
            '!src/**/setupTests.ts'
        ]
    ).pipe(tscProject());

    return merge([
        tsResult.dts.pipe(header(headerTemplate, {pkg: pkg})).pipe(gulp.dest('lib')),
        tsResult.js.pipe(header(headerTemplate, {pkg: pkg})).pipe(gulp.dest('lib'))
    ]);
};

const cleanBundles = () => {
    return gulp.src('bundles/*')
        .pipe(clean({read: false, force: true}));
};

const umd = () => {
    return rollup({
        input: './src/main.ts',
        rollup: require('rollup'),
        external: ['react', 'react-dom', 'react-dom/server', 'prop-types', 'ag-grid-community'],
        output: {
            name: 'AgGridReact',
            file: 'my-file.umd.js',
            format: 'umd',
            globals: {
                react: 'React',
                'react-dom': 'ReactDOM',
                'react-dom/server': 'ReactDOMServer',
                'prop-types': 'PropTypes',
                'ag-grid-community': 'agGrid'
            },
        },
        plugins: [typescript(), commonjs(), uglify()]
    })
        .pipe(source('ag-grid-react.min.js'))
        .pipe(gulp.dest('./bundles'))
};

const amd = () => {
    return rollup({
        input: './src/main.ts',
        rollup: require('rollup'),
        external: ['react', 'react-dom', 'react-dom/server', 'prop-types', 'ag-grid-community'],
        output: {
            file: 'my-file.amd.js',
            format: 'amd'
        },
        plugins: [
            typescript(),
            commonjs(),
            uglify()
        ]
    })
        .pipe(source('ag-grid-react.amd.min.js'))
        .pipe(replace('ag-grid-community', 'agGrid')) // the alias plugin should do this for us, but the mix of ts, cjs and alias just didn't get on
        .pipe(gulp.dest('./bundles'))
};

const watch = () => {
    gulp.watch([
            './src/*',
            './node_modules/ag-grid-community/dist/lib/**/*'],
        tscTask);
};

const linkUmdForE2E = (done) => {
    let linkType = 'symbolic';
    if (WINDOWS) {
        console.log('creating window links...');
        linkType = 'junction';
    }

    if (!fs.existsSync('./cypress/integration/ag-grid-react.min.js')) {
        link('./bundles/ag-grid-react.min.js', './cypress/integration/', {
            force: true,
            type: linkType
        })
    }
    if (!fs.existsSync('./cypress/integration/ag-grid-community.min.js')) {
        link('../../grid-community-modules/all-modules/dist/ag-grid-community.min.js', './cypress/integration/', {
            force: true,
            type: linkType
        })
    }
    done();
};

const copyFromModuleSource = () => {
    const copySource = gulp.src(
        [
            "**/*",
            '!**/__tests__*/**/*',
            '!**/*Test*'
        ], {cwd: '../../grid-community-modules/react/src'})
        .pipe(replace('@ag-grid-community/core', 'ag-grid-community'))
        .pipe(replace('@ag-grid-enterprise', 'ag-grid-enterprise'))
        .pipe(gulp.dest("./src"), {cwd: '.'});

    const copyMain = gulp.src(["../../grid-community-modules/react/main.d.ts",
        "../../grid-community-modules/react/main.js"])
        .pipe(gulp.dest("./"));

    return merge(copySource, copyMain);
};

gulp.task('copy-from-module-source', copyFromModuleSource);
gulp.task('clean-bundles', cleanBundles);
gulp.task('create-umd-bundle', umd);
gulp.task('create-amd-bundle', amd);
gulp.task('create-bundles', series('create-umd-bundle', 'create-amd-bundle'));
gulp.task('link-umd-e2e', linkUmdForE2E);
gulp.task('clean-lib', cleanLib);
gulp.task('tsc', tscTask);
gulp.task('watch', series('tsc', watch));
gulp.task('default', series('clean-lib', 'copy-from-module-source', 'tsc', "clean-bundles", "create-bundles"));
