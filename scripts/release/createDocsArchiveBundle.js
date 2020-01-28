const walk = require('walk');
const fs = require('fs');
const archiver = require('archiver');

const LATEST_HASH = require('child_process').execSync('cat .git/refs/heads/latest').toString().trim();

if (process.argv.length !== 3) {
    console.log("Usage: node scripts/release/createDocsArchiveBundle.js [Version Number]");
    console.log("For example: node scripts/release/createDocsArchiveBundle.js 19.1.0");
    console.log("Note: This script should be run from the root of the monorepo");
    process.exit(1);
}

const [exec, scriptPath, newVersion] = process.argv;

const DIST_PATH = 'grid-packages/ag-grid-docs/dist';

function getArchiveFilename() {
    const now = new Date();
    return `archive_${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}_${newVersion}.zip`
}

function isRootIndexPhp(filename) {
    return filename === `${DIST_PATH}/index.php`;
}

function isDocHeaderPhp(filename) {
    return filename === `${DIST_PATH}/documentation-main/documentation_header.php`;
}

function preProcessRootIndex(fileContents) {
    return `
        <!DOCTYPE html>
        <html style="height: 100%">
        <head lang="en">
        <meta charset="UTF-8">
        <meta http-equiv="refresh" content="0; URL='https://www.ag-grid.com/archive/${newVersion}/documentation-main/documentation.php'" />
        </head>        
        <body class="big-text">
        </body>
        </html>`
}

function preDocHeader(fileContents, latestHash) {
    // replace $version with archive version (determines root - ie /archive/<version> instead of just /)
    let re = /\$version.*=.*'latest'/;
    const {index} = re.exec(fileContents);

    let startIndex = fileContents.indexOf("'latest'", index) + 1;
    let endIndex = fileContents.indexOf("'", startIndex);

    fileContents=`${fileContents.substr(0, startIndex)}${newVersion}${fileContents.substr(endIndex, fileContents.length)}`;

    // insert latest hash - useful to determine which changes should be in a given archive
    re = /\$latest_hash.*=.*''/;
    startIndex = fileContents.indexOf("''", index) + 1;
    endIndex = fileContents.indexOf("'", startIndex);
    fileContents=`${fileContents.substr(0, startIndex)}${latestHash}${fileContents.substr(endIndex, fileContents.length)}`;

    return fileContents;
}


function deleteArchive() {
    if (fs.existsSync(archiveFileName)) {
        fs.unlinkSync(archiveFileName);
    }
}

function createArchive(filename) {
    const output = fs.createWriteStream(`./${filename}`);
    const archive = archiver('zip', {
        zlib: {level: 9} // Sets the compression level.
    });
    output.on('close', () => {
       console.log(`Archive Complete: ${filename}`);
    });
    archive.pipe(output);
    return archive;
}

const walker = walk.walk(DIST_PATH, {});

const archiveFileName = getArchiveFilename();
deleteArchive(archiveFileName);
const archive = createArchive(archiveFileName);

console.log('Walking "dist" Folder');
walker.on("file", (root, fileStats, next) => {
    const fullFileName = `${root}/${fileStats.name}`;

    let fileContents = null;
    if (isRootIndexPhp(fullFileName)) {
        fileContents = preProcessRootIndex(fs.readFileSync(fullFileName, 'utf8'));
    } else if (isDocHeaderPhp(fullFileName, fileStats)) {
        fileContents = preDocHeader(fs.readFileSync(fullFileName, 'utf8'), LATEST_HASH);
    } else {
        fileContents = fs.createReadStream(fullFileName);
    }

    archive.append(fileContents, {
        name: fullFileName.replace(`${DIST_PATH}/`, '')
    });

    next();
});

walker.on("end", () => {
    archive.finalize();
    console.log("Finalising Archive");
});

