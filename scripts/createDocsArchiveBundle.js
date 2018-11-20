const walk = require('walk');
const fs = require('fs');
const archiver = require('archiver');

if (process.argv.length !== 3) {
    console.log("Usage: node scripts/createDocsArchiveBundle.js [Version Number]");
    console.log("For example: node scripts/createDocsArchiveBundle.js 19.1.0");
    console.log("Note: This script should be run from the root of the monorepo");
    process.exit(1);
}

const [exec, scriptPath, newVersion] = process.argv;

const DIST_PATH = 'packages/ag-grid-docs/dist';

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

function preDocHeader(fileContents) {
    const re = /\$version.*=.*'latest'/;
    const {index} = re.exec(fileContents);

    const startIndex = fileContents.indexOf("'latest'", index) + 1;
    const endIndex = fileContents.indexOf("'", startIndex);

    return `${fileContents.substr(0, startIndex)}${newVersion}${fileContents.substr(endIndex, fileContents.length)}`;
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
        fileContents = preDocHeader(fs.readFileSync(fullFileName, 'utf8'));
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

