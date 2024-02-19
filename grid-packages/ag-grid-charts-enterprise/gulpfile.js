const gulp = require('gulp');
const merge = require('merge2');
const fs = require('fs');

const copyFiles = (done) => {
    if (!fs.existsSync('./node_modules/ag-grid-enterprise/styles/ag-grid.css')) {
        done("./node_modules/ag-grid-community/styles doesn't exist - exiting")
    }

    if (!fs.existsSync('./node_modules/ag-grid-enterprise/dist/ag-grid-charts-enterprise.cjs.js')) {
        done("required ./node_modules/ag-grid-enterprise/dist files don't exist - exiting")
    }

    return merge([
            gulp.src('./node_modules/ag-grid-enterprise/main.d.ts').pipe(gulp.dest('./')),
            gulp.src('./node_modules/ag-grid-enterprise/styles/**/*').pipe(gulp.dest('./styles')),
            gulp.src('./node_modules/ag-grid-enterprise/dist/*charts-enterprise*').pipe(gulp.dest('./dist')),
            gulp.src('./node_modules/ag-grid-enterprise/dist/ag-grid-charts-enterprise*').pipe(gulp.dest('./dist')),
            gulp.src('./node_modules/ag-grid-enterprise/dist/lib/**/*').pipe(gulp.dest('./dist/lib'))
        ]
    );
};

gulp.task('default', copyFiles);


