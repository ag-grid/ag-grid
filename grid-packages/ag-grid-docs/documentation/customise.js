const fs = require('fs-extra');

const addMarkdownIncludeSupport = () => {
    console.log(`-> Adding support for including Markdown files into other Markdown files`);
    fs.copyFileSync('./customisations/gatsby-source-filesystem/index.js', './node_modules/gatsby-source-filesystem/index.js');
};

const fixScrollingIssue = () => {
    console.log(`-> Fixing scrolling issue for hash URLs`);

    const location = './node_modules/gatsby-remark-autolink-headers/gatsby-browser.js';
    const contents = fs.readFileSync(location, 'utf8');
    const newContents = contents.replace('exports.onInitialClientRender', 'exports.onInitialClientRender = function() {}; var ignore');

    if (newContents != contents) {
        fs.writeFileSync(location, newContents);
    }
};

console.log(`--------------------------------------------------------------------------------`);
console.log(`Applying customisations...`);

addMarkdownIncludeSupport();
fixScrollingIssue();

console.log(`Done.`);
console.log(`--------------------------------------------------------------------------------`);