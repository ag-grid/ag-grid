const fs = require('fs-extra');

const applyCustomisation = (packageName, expectedVersion, customisation) => {
    const version = require(`./node_modules/${packageName}/package.json`).version;
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
}

const addMarkdownIncludeSupport = () => {
    // updates the method for reading files to automatically replace the Markdown imports with file contents at this stage

    return applyCustomisation('gatsby-source-filesystem', '2.11.0', {
        name: 'Add support for including Markdown files into other Markdown files',
        apply: () => updateFileContents(
            './node_modules/gatsby-source-filesystem/index.js',
            `
function loadNodeContent(fileNode) {
  return fs.readFile(fileNode.absolutePath, \`utf-8\`);
}`,
            `const path = require('path');

function loadNodeContent(fileNode) {
    const sourcePath = path.dirname(fileNode.absolutePath);

    // this allows Markdown files to import other Markdown files using md-include syntax
    return fs.readFile(fileNode.absolutePath, \`utf-8\`).then(value => {
        if (fileNode.extension !== 'md') { return value; }

        return value.replace(/\\bmd-include:(\\S+)/g, (_, filename) => {
            const includeFileName = path.join(sourcePath, \`_\${filename}\`);

            return fs.readFileSync(includeFileName);
        });
    });
}`)
    });
};

const fixScrollingIssue = () => {
    // removes some of the scroll handling that this plugin adds which seems to cause the page to scroll to the wrong
    // position when hash URLs are initially loaded

    return applyCustomisation('gatsby-remark-autolink-headers', '2.11.0', {
        name: 'Fix scrolling issue for hash URLs',
        apply: () => updateFileContents(
            './node_modules/gatsby-remark-autolink-headers/gatsby-browser.js',
            'exports.onInitialClientRender = function (_',
            'exports.onInitialClientRender = function() {}; var ignore = function (_'
        )
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
