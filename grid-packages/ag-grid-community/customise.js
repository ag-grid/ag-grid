/**
 * There are some issues which we have had to resolve by editing plugins as it was the only way to achieve what we
 * needed to. This script applies these customisations by replacing content inside the node_modules after they've been
 * installed; perhaps we should fork the plugins properly and point to those instead.
 */

const fs = require('fs-extra');

const applyCustomisation = (packageName, expectedVersion, customisation, providedPath = null, optional = false) => {
    const packagePath = providedPath ? providedPath : `./node_modules/${packageName}/package.json`;
    if (!fs.existsSync(packagePath) && optional) {
        console.log(`${packagePath} doesn't exist but is optional - skipping`);
        return true;
    }

    const version = require(packagePath).version;
    const versionMatches = version === expectedVersion;

    if (versionMatches) {
        customisation.apply();
        console.log(`✓ ${customisation.name}`);
    } else {
        console.error(`✗ ${customisation.name}`);
        console.error(`Customisation failed: Expected version ${expectedVersion} of ${packageName} but found ${version}. You should test the customisation with the new version and update the expected version number if it works.`);
    }

    return versionMatches;
};

const updateFileContents = (filename, existingContent, newContent) => {
    const contents = fs.readFileSync(filename, 'utf8');
    const newContents = contents.replace(existingContent, newContent);

    if (newContents !== contents) {
        fs.writeFileSync(filename, newContents);
    }
};

const forceEs5ForCjsBundles = () => {

    return applyCustomisation('rollup-plugin-node-resolve', '5.2.0', {
        name: `Force ES5 for CJS bundles`,
        apply: () => updateFileContents(
            './node_modules/rollup-plugin-node-resolve/dist/rollup-plugin-node-resolve.cjs.js',
            'if (typeof pkg[field] === \'string\') {',
            `if (options.format === 'es5-cjs') {
                 pkg['main'] = "./dist/esm/es5/main.js";
             } else if (typeof pkg[field] === 'string') {`
        )
    });
};

console.log(`--------------------------------------------------------------------------------`);
console.log(`Applying customisations...`);

const success = [
    forceEs5ForCjsBundles(),
].every(x => x);

if (success) {
    console.log(`Finished!`);
} else {
    console.error('Failed.');
    process.exitCode = 1;
}

console.log(`--------------------------------------------------------------------------------`);
