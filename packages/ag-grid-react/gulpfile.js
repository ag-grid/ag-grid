const gulp = require('gulp');
const gulpTypescript = require('gulp-typescript');
const header = require('gulp-header');
const merge = require('gulp-merge');
const pkg = require('./package.json');
const tsConfig = 'tsconfig.json';

const headerTemplate = '// <%= pkg.name %> v<%= pkg.version %>\n';
const tsProject = gulpTypescript.createProject(tsConfig);

gulp.task('default', ['commonjs', 'umd']);

gulp.task('commonjs', tscTask);

async function tscTask() {
    const tsResult = await gulp.src('src/**/*.ts').pipe(tsProject());

    return merge([
        tsResult.dts.pipe(header(headerTemplate, {pkg: pkg})).pipe(gulp.dest('lib')),
        tsResult.js.pipe(header(headerTemplate, {pkg: pkg})).pipe(gulp.dest('lib'))
    ]);
}

gulp.task('watch', ['commonjs'], () => {
    gulp.watch([
        './src/*',
        './node_modules/ag-grid-community/dist/lib/**/*'],
    ['commonjs']);
});

const typescript = require('rollup-plugin-typescript');
const commonjs = require('rollup-plugin-commonjs');
const uglify = require('rollup-plugin-uglify').uglify;
const rollup = require('rollup-stream');
const source = require('vinyl-source-stream');

gulp.task('umd', () => rollup({
    input: './src/main.ts',
    rollup: require('rollup'),
    output: {
        name: 'AgGridReact',
        file: 'my-file.umd.js',
        format: 'umd',
        globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            'prop-types': 'PropTypes',
            'ag-grid-community': 'agGrid'
        },
    },
    plugins: [typescript(), commonjs(),
        uglify()
    ]
})
    .pipe(source('ag-grid-react.min.js'))
    .pipe(gulp.dest('./umd'))
);
