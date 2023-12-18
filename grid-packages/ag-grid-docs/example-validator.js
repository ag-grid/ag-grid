const os = require('os');
const cp = require('child_process');
const { processStdio } = require('./utils');
const WINDOWS = /^win/.test(os.platform());
const fs = require('fs');
const glob = require('glob');

function getTscPath() {
    return WINDOWS ? 'node_modules\\.bin\\tsc.cmd' : 'node_modules/.bin/tsc';
}

/** Called from dev-server.js */
module.exports.watchValidateExampleTypes = async () => {
    console.log('Watching TS example files only...');
    const tsc = getTscPath();
    const tsWatch = cp.spawn(
        tsc,
        [
            '--watch',
            '--preserveWatchOutput',
            '--project',
            './grid-packages/ag-grid-docs/documentation/tsconfig.watch.json',
        ],
        {
            cwd: WINDOWS ? '..\\..\\' : '../../',
            stdio: 'pipe',
            encoding: 'buffer',
        }
    );

    tsWatch.stdout.on(
        'data',
        processStdio((output) => {
            const formattedOutput = output
                .split('\n')
                .map((line) => `Example Validator: ${line}`)
                .join('\n');
            if (formattedOutput.includes('Found 0 errors.')) {
                console.log(formattedOutput);
            } else {
                console.error(formattedOutput);
            }
        })
    );

    process.on('exit', () => {
        tsWatch.kill();
    });
    process.on('SIGINT', () => {
        tsWatch.kill();
    });
};

module.exports.validateExampleTypes = async () => {
    const tsc = getTscPath();
    console.log('Validating Typescript examples with Typescript ');

    const versionResult = cp.spawnSync(tsc, ['--version', './grid-packages/ag-grid-docs/documentation/tsconfig.json'], {
        stdio: 'inherit',
        cwd: WINDOWS ? '..\\..\\' : '../../',
    });

    const result = cp.spawnSync(tsc, ['--build', './grid-packages/ag-grid-docs/documentation/tsconfig.json'], {
        stdio: 'inherit',
        cwd: WINDOWS ? '..\\..\\' : '../../',
    });

    if (result && result.status !== 0) {
        console.log('[ERROR] example-validator.js Validating Typescript examples');
        process.exit(result.status);
    }
    console.log('Typescript examples validated.');
};

async function findBadPackageImports(globPattern, searchRegex) {
    let errors = 0;
    // Use glob to match file paths based on the provided pattern
    glob(globPattern, async (err, paths) => {
        if (err) {
            console.error('Error while matching files:', err);
            return;
        }
        // Iterate through the matched paths
        paths.forEach((filePath) => {
            // Use fs.stat to check if the path is a file
            fs.stat(filePath, async (err, stats) => {
                if (err) {
                    console.error('Error while checking file status:', filePath, err);
                    return;
                }

                // Check if the path is a file
                if (stats.isFile()) {
                    // Read the content of the file
                    await fs.readFile(filePath, 'utf8', (err, content) => {
                        if (err) {
                            console.error('Error while reading file:', filePath, err);
                            return;
                        }

                        // Check if the string is present in the file content
                        if (searchRegex.test(content)) {
                            console.error(`[ERROR] example-validator.js Package imports found in provided modules example file: ${filePath}` + '  ' + errors);
                            errors++;
                            //process.exit(1);
                        }
                    });
                }
            });
        });
    });
    return errors;
}

// *** Don't remove these unused vars! ***
const [cmd, script, execFunc] = process.argv;

if (process.argv.length >= 3 && execFunc === 'watch') {
    this.watchValidateExampleTypes();
} else if (process.argv.length >= 3 && execFunc === 'validate') {
    // Make sure that provided examples use modules instead of packages
    findBadPackageImports(
        './documentation/doc-pages/**/examples/*/provided/**',
        /import(.*)['"](ag-grid-enterprise|ag-grid-community|ag-grid-community\/styles|ag-grid-react|ag-grid-angular|ag-grid-vue|ag-grid-vue3)/g
    );
    this.validateExampleTypes();
}
