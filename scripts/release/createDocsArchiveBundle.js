const walk = require('walk');
const fs = require('fs');
const archiver = require('archiver');

const LATEST_HASH = require('child_process').execSync('grep origin/latest .git/packed-refs | cut -d " " -f1').toString().trim();
const LATEST_HASH_TIMESTAMP = require('child_process').execSync(`git show -s --format=%ci ${LATEST_HASH}`).toString().trim();

if (process.argv.length !== 4) {
    console.log("Usage: node scripts/release/createDocsArchiveBundle.js [Version Number] [archive filename]");
    console.log("For example: node scripts/release/createDocsArchiveBundle.js 19.1.0");
    console.log("Note: This script should be run from the root of the monorepo");
    process.exit(1);
}

const [exec, scriptPath, newVersion, archiveFileName] = process.argv;

const DIST_PATH = 'grid-packages/ag-grid-docs/dist';


function isRootIndexPhp(filename) {
    return filename === `${DIST_PATH}/index.php`;
}

function isDocHeaderPhp(filename) {
    return filename === `${DIST_PATH}/documentation-main/documentation_header.php`;
}

function createRootIndex() {
    return `
        <!DOCTYPE html>
        <html style="height: 100%">
        <head lang="en">
        <meta charset="UTF-8">
        <meta name="robots" content="noindex">
        <meta http-equiv="refresh" content="0; URL='https://www.ag-grid.com/archive/${newVersion}/documentation/'" />
        </head>
        <body class="big-text">
        </body>
        </html>`;
}

function preDocHeader(fileContents, latestHash, latestHashTimestamp) {
    // replace $version with archive version (determines root - ie /archive/<version> instead of just /)
    let re = /\$version.*=.*'latest'/;
    const { index } = re.exec(fileContents);

    let startIndex = fileContents.indexOf("'latest'", index) + 1;
    let endIndex = fileContents.indexOf("'", startIndex);

    fileContents = `${fileContents.substr(0, startIndex)}${newVersion}${fileContents.substr(endIndex, fileContents.length)}`;

    // insert latest hash - useful to determine which changes should be in a given archive
    startIndex = fileContents.indexOf("''", index) + 1;
    endIndex = fileContents.indexOf("'", startIndex);
    fileContents = `${fileContents.substr(0, startIndex)}${latestHash}${fileContents.substr(endIndex, fileContents.length)}`;

    // insert latest hash timestamp - useful to determine which changes should be in a given archive
    startIndex = fileContents.indexOf("''", index) + 1;
    endIndex = fileContents.indexOf("'", startIndex);
    fileContents = `${fileContents.substr(0, startIndex)}${latestHashTimestamp}${fileContents.substr(endIndex, fileContents.length)}`;

    return fileContents;
}


function deleteArchive() {
    if (fs.existsSync(archiveFileName)) {
        fs.unlinkSync(archiveFileName);
    }
}

function createArchive(filename) {
    const output = fs.createWriteStream(`./${filename}`);
    const archive = archiver('tar', {
        // we don't use gzip here as we'll get a "too many files" error if we do
        // post creation we'll zip the resulting tar file
        zlib: { level: 9 } // Sets the compression level.
    });
    output.on('close', () => {
        console.log(`Archive Complete: ${filename}`);
    });
    archive.pipe(output);
    return archive;
}

const walker = walk.walk(DIST_PATH, {});

deleteArchive(archiveFileName);
const archive = createArchive(archiveFileName);

console.log('Walking "dist" Folder');
walker.on("file", (root, fileStats, next) => {
    const fullFileName = `${root}/${fileStats.name}`;

    let fileContents = null;

    if (isRootIndexPhp(fullFileName)) {
        fileContents = createRootIndex();
    } else if (isDocHeaderPhp(fullFileName, fileStats)) {
        fileContents = preDocHeader(fs.readFileSync(fullFileName, 'utf8'), LATEST_HASH, LATEST_HASH_TIMESTAMP);
    } else {
        fileContents = fs.createReadStream(fullFileName);
    }

    archive.append(fileContents, {
        name: fullFileName.replace(`${DIST_PATH}/`, '')
    });

    next();
});

walker.on("end", () => {
    archive.append("User-agent: * Disallow: /", {
        name: 'robots.txt'
    });

    archive.finalize();
    console.log("Finalising Archive");
});

