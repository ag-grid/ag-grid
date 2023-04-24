const os = require('os');
const cp = require('child_process');
const {processStdio} = require("./utils");
const WINDOWS = /^win/.test(os.platform());

function getTscPath() {
    return WINDOWS ? 'node_modules\\.bin\\tsc.cmd' : 'node_modules/.bin/tsc';
}

/** Called from dev-server.js */
module.exports.watchValidateExampleTypes = async () => {
    console.log("Watching TS example files only...");
    const tsc = getTscPath();
    const tsWatch = cp.spawn(tsc, ['--watch', "--project", "./grid-packages/ag-grid-docs/documentation/tsconfig.watch.json"], {
        cwd: WINDOWS ? '..\\..\\' : '../../',
        stdio: 'pipe',
        encoding: 'buffer'
    });
    tsWatch.stdout.on('data', processStdio((output) => {
        if (!output.includes("Found 0 errors.")) {
            console.error('Example Validator: ' + output);
        } else {
            console.log('Example Validator: ' + output);
        }
    }));

    process.on('exit', () => {
        tsWatch.kill();
    });
    process.on('SIGINT', () => {
        tsWatch.kill();
    });
};


module.exports.validateExampleTypes = async () => {
    const tsc = getTscPath();
    console.log('Validating Typescript examples with Typescript ',)

    const versionResult = cp.spawnSync(tsc, ['--version', "./grid-packages/ag-grid-docs/documentation/tsconfig.json"], {
        stdio: 'inherit',
        cwd: WINDOWS ? '..\\..\\' : '../../'
    });

    const result = cp.spawnSync(tsc, ['--build', "./grid-packages/ag-grid-docs/documentation/tsconfig.json"], {
        stdio: 'inherit',
        cwd: WINDOWS ? '..\\..\\' : '../../'
    });

    if (result && result.status !== 0) {
        console.log('ERROR Validating Typescript examples');
        process.exit(result.status);
    }
    console.log("Typescript examples validated.");
}


// *** Don't remove these unused vars! ***
const [cmd, script, execFunc] = process.argv;

if (process.argv.length >= 3 && execFunc === 'watch') {
    this.watchValidateExampleTypes();
} else if (process.argv.length >= 3 && execFunc === 'validate') {
    this.validateExampleTypes();
}
