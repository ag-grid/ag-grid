const fs = require('fs-extra');

const applyCustomisation = (packageName, expectedVersion, customisation) => {
    const version = require(`./node_modules/${packageName}/package.json`).version;
    const versionMatches = version === expectedVersion;

    if (versionMatches) {
        customisation.apply();
        console.log(`✓ ${customisation.name}`);
    } else {
        console.error(`✗ ${customisation.name}`);
        console.error(`Customisation failed: Expected version ${expectedVersion} of ${packageName} but found ${version}`);
    }

    return versionMatches;
};

const addMarkdownIncludeSupport = () => {
    return applyCustomisation('gatsby-source-filesystem', '2.11.0', {
        name: 'Add support for including Markdown files into other Markdown files',
        apply: () => fs.copyFileSync('./customisations/gatsby-source-filesystem/index.js', './node_modules/gatsby-source-filesystem/index.js')
    });
};

const fixScrollingIssue = () => {
    return applyCustomisation('gatsby-remark-autolink-headers', '2.11.0', {
        name: 'Fix scrolling issue for hash URLs',
        apply: () => {
            const location = './node_modules/gatsby-remark-autolink-headers/gatsby-browser.js';
            const contents = fs.readFileSync(location, 'utf8');
            const newContents = contents.replace('exports.onInitialClientRender', 'exports.onInitialClientRender = function() {}; var ignore');

            if (newContents !== contents) {
                fs.writeFileSync(location, newContents);
            }
        }
    });
};

console.log(`--------------------------------------------------------------------------------`);
console.log(`Applying customisations...`);

const success = [
    addMarkdownIncludeSupport(),
    fixScrollingIssue(),
].every(x => x);

if (success) {
    console.log(`Finished!`);
} else {
    console.error('Failed.');
    process.exitCode = 1;
}

console.log(`--------------------------------------------------------------------------------`);
