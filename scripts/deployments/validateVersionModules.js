// Note: Assumes working directory is the root of the mono-repo
//
// Validates that all files updated by versionModules.js contain the expected
// grid version, charts version, and environment values.

const fs = require('fs');
const path = require('path');

const getPackageInformation = require('./utils/utils').getPackageInformation;

const ROOT_PACKAGE_JSON = '../../package.json';
const packageDirectories = require(ROOT_PACKAGE_JSON).workspaces.packages.filter((d) => !d.startsWith('external/'));
const SKIPPED_DEPS = new Set(['ag-grid-testing']);

if (process.argv.length < 4) {
    console.log(
        'Usage: node scripts/deployments/validateVersionModules.js [Grid Version] [Charts Version] [Environment]'
    );
    console.log('For example: node scripts/deployments/validateVersionModules.js 33.0.0 11.0.0 production');
    console.log('Note: This script should be run from the root of the monorepo');
    process.exit(1);
}

const [exec, scriptPath, gridVersion, chartsVersion, environment] = process.argv;

if (!gridVersion || !chartsVersion || !environment) {
    console.error('ERROR: Grid version, charts version, and environment are all required');
    console.error('node scripts/deployments/validateVersionModules.js <grid version> <charts version> <environment>');
    process.exit(1);
}

if (!['production', 'archive', 'local'].includes(environment)) {
    console.error('ERROR: Invalid environment supplied. Must be one of: production|archive|local');
    process.exit(1);
}

console.log('************************************************************************************************');
console.log(`Validating Grid Version: ${gridVersion}, Charts Version: ${chartsVersion}, Environment: ${environment}`);
console.log('************************************************************************************************');

const errors = [];

function error(message) {
    errors.push(message);
    console.error(`  ERROR: ${message}`);
}

// 1. Validate root .env file
function validateEnvFile() {
    console.log('\nChecking .env file...');

    const envPath = './.env';
    if (!fs.existsSync(envPath)) {
        error('.env file does not exist');
        return;
    }

    const content = fs.readFileSync(envPath, 'utf-8');
    const lines = content.split('\n');

    const envVars = {};
    for (const line of lines) {
        const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
        if (match) {
            envVars[match[1]] = match[2];
        }
    }

    const expected = {
        BUILD_GRID_VERSION: gridVersion,
        BUILD_CHARTS_VERSION: chartsVersion,
        ENV: environment,
    };

    for (const [key, expectedValue] of Object.entries(expected)) {
        if (!(key in envVars)) {
            error(`.env is missing ${key}`);
        } else if (envVars[key] !== expectedValue) {
            error(`.env has ${key}=${envVars[key]} but expected ${expectedValue}`);
        }
    }
}

// 2. Validate root package.json version
function validateRootPackageJson() {
    console.log('\nChecking root package.json...');

    const resolvedPath = path.resolve(__dirname, ROOT_PACKAGE_JSON);
    const packageJson = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));

    if (packageJson.version !== gridVersion) {
        error(`root package.json version is ${packageJson.version} but expected ${gridVersion}`);
    }
}

// 3. Validate workspace package.json files (version + ag deps)
function validatePackageJsonFiles() {
    console.log('\nChecking workspace package.json files...');

    const allPackages = getPackageInformation();

    for (const [_, pkg] of Object.entries(allPackages)) {
        const { projectRoot, version } = pkg;

        // versionModules.js sets every package version to gridVersion unconditionally
        if (version !== gridVersion) {
            error(`${projectRoot}/package.json version is ${version} but expected ${gridVersion}`);
        }

        // Check ag-grid dependencies
        for (const [dep, depVersion] of Object.entries(pkg.agGridDeps)) {
            if (SKIPPED_DEPS.has(dep)) {
                continue;
            }
            if (depVersion !== gridVersion) {
                error(`${projectRoot}/package.json dependency ${dep} is ${depVersion} but expected ${gridVersion}`);
            }
        }

        // Check ag-grid peer dependencies
        for (const [dep, depVersion] of Object.entries(pkg.agGridPeerDeps)) {
            if (SKIPPED_DEPS.has(dep)) {
                continue;
            }
            if (depVersion !== gridVersion) {
                error(`${projectRoot}/package.json peerDependency ${dep} is ${depVersion} but expected ${gridVersion}`);
            }
        }

        // Check ag-grid optional dependencies
        for (const [dep, depVersion] of Object.entries(pkg.agGridOptionalDeps)) {
            if (SKIPPED_DEPS.has(dep)) {
                continue;
            }
            if (depVersion !== gridVersion) {
                error(
                    `${projectRoot}/package.json optionalDependency ${dep} is ${depVersion} but expected ${gridVersion}`
                );
            }
        }

        // Check ag-charts dependencies
        for (const [dep, depVersion] of Object.entries(pkg.agChartDeps)) {
            if (depVersion !== chartsVersion) {
                error(`${projectRoot}/package.json dependency ${dep} is ${depVersion} but expected ${chartsVersion}`);
            }
        }

        // Check ag-charts optional dependencies
        for (const [dep, depVersion] of Object.entries(pkg.agChartOptionalDeps)) {
            if (depVersion !== chartsVersion) {
                error(
                    `${projectRoot}/package.json optionalDependency ${dep} is ${depVersion} but expected ${chartsVersion}`
                );
            }
        }

        // Check angular sub-project
        if (pkg.agSubAngularVersion) {
            if (pkg.agSubAngularVersion !== gridVersion) {
                error(
                    `${projectRoot} angular sub-project version is ${pkg.agSubAngularVersion} but expected ${gridVersion}`
                );
            }
        }

        if (pkg.agSubAngularGridDeps) {
            for (const [dep, depVersion] of Object.entries(pkg.agSubAngularGridDeps)) {
                if (depVersion !== gridVersion) {
                    error(
                        `${projectRoot} angular sub-project peerDependency ${dep} is ${depVersion} but expected ${gridVersion}`
                    );
                }
            }
        }

        if (pkg.agSubAngularChartDeps) {
            for (const [dep, depVersion] of Object.entries(pkg.agSubAngularChartDeps)) {
                if (depVersion !== chartsVersion) {
                    error(
                        `${projectRoot} angular sub-project peerDependency ${dep} is ${depVersion} but expected ${chartsVersion}`
                    );
                }
            }
        }
    }
}

// 4. Validate version.ts files
function validateVersionFiles() {
    console.log('\nChecking version.ts files...');

    const CWD = process.cwd();
    const regex = /export const VERSION = '(.*)';/;

    packageDirectories.forEach((packageDirectory) => {
        const versionFile = `${CWD}/${packageDirectory}/src/version.ts`;
        if (!fs.existsSync(versionFile)) {
            return;
        }

        const contents = fs.readFileSync(versionFile, 'utf8');
        const match = contents.match(regex);
        if (!match) {
            error(`${packageDirectory}/src/version.ts does not contain a VERSION export`);
        } else if (match[1] !== gridVersion) {
            error(`${packageDirectory}/src/version.ts has VERSION '${match[1]}' but expected '${gridVersion}'`);
        }
    });
}

// Run all validations
validateEnvFile();
validateRootPackageJson();
validatePackageJsonFiles();
validateVersionFiles();

console.log('\n************************************************************************************************');
if (errors.length > 0) {
    console.error(`FAILED: ${errors.length} error(s) found`);
    process.exit(1);
} else {
    console.log('SUCCESS: All versions are correct');
}
