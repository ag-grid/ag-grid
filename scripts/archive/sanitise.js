/*
* removes seo & cookie tracking type scripts/blocks from an archive
* to be run from /home/aggrid/public_html/archive/cleanArchive and an archive version supplied
* eg:
* cd /home/aggrid/public_html/archive/cleanArchive/
* /opt/cpanel/ea-nodejs10/bin/node sanitise.js 26.0.0
*/
const fs = require('fs');
const parse5 = require('parse5');
const execFile = require('child_process').execFile;
const walk = require('walk');

const args = process.argv.slice(2)

if(!args[0]) {
    console.error('No release provided');
    process.exit(0);
}

const release = args[0];
const releasePath = `../${release}`;
if (!fs.existsSync(releasePath)) {
    console.error(`${releasePath} does not exist`);
    process.exit(0);
}

let modified = false;

const removalSnippets = [
    'adsbygoogle',
    'googletagmanager',
    'linkedin',
    'lms-analytics',
    'googleads',
    'google-analytics'
]

const containsContentToBeRemoved = node => {
    if (node.value && removalSnippets.some(snippet => node.value.includes(snippet)) ||
        node.attrs && removalSnippets.some(snippet => node.attrs.some(attr => attr.value.includes(snippet)))) {
        return true;
    }

    if (node.childNodes) {
        return node.childNodes.some(containsContentToBeRemoved)
    }

    return false;
};

const scrubNode = node => {
    if (node.tagName === 'script' ||
        node.tagName === 'noscript' ||
        node.tagName === 'img') {
        if (containsContentToBeRemoved(node)) {
            node.parentNode.childNodes = node.parentNode.childNodes.filter(childNode => childNode !== node)
            modified = true;
        }
    }
}

const scrubNodeRecursively = node => {
    scrubNode(node);
    if (node.childNodes) {
        node.childNodes.forEach(scrubNodeRecursively)
    }
}

const scrubFile = filename => {
    const contents = fs.readFileSync(filename, 'UTF8');
    const root = parse5.parse(contents);

    scrubNodeRecursively(root)

    return parse5.serialize(root);
}

const walker = walk.walk('../26.1.0/', {
    filters: ['node_modules', '_gen', 'cleanArchive', 'zipped'],
});

const removeGoogleTagManager = filename => {
    const contents = fs.readFileSync(filename, 'UTF8');
    const start = contents.indexOf('<!-- Google Tag Manager -->')
    const end = contents.indexOf('<!-- End Google Tag Manager -->');
    return contents.substr(0, start) + contents.substr(end, contents.length);
};

console.log('Starting...');
walker.on("file", (root, fileStats, next) => {
    if (fileStats.name.endsWith('.html') || fileStats.name.endsWith('.php')) {
        process.stdout.write(".");
        const fullFileName = `${root}/${fileStats.name}`;

        let scrubbedContents;
        if(fullFileName.includes('includes/html-helpers.php')) {
            scrubbedContents = removeGoogleTagManager(fullFileName);
        } else {
            scrubbedContents = scrubFile(fullFileName);
        }

        if(modified) {
            console.log(fullFileName);
            execFile('/bin/cp', [fullFileName, `${fullFileName}.bak`]);
            fs.writeFileSync(fullFileName, scrubbedContents, "UTF8");
            modified = false;
        }
    }

    next();
});

walker.on("end", () => {
    console.log("Finished");
});
