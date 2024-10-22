const fs = require('fs');

function copyFileWithTSNoCheck(sourceFile, destinationDir, destinationFile) {
    fs.readFile(sourceFile, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file: ${err}`);
            return;
        }

        const targetDir = `${__dirname}/${destinationDir}`;
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir);
        }

        // Prepend '@ts-nocheck' to the content so we don't have to worry about typescript errors
        const modifiedContent = `// eslint-disable-next-line @typescript-eslint/ban-ts-comment\n// @ts-nocheck\n${data}`;
        fs.writeFile(
            `${targetDir}/${destinationFile}`,
            modifiedContent,
            {
                encoding: 'utf8',
                flag: 'w',
            },
            (err) => {
                if (err) {
                    console.error(`Error writing file: ${err}`);
                    return;
                }
            }
        );
    });
}

const srcPropertyKeys = '../../packages/ag-grid-community/src/eventTypes.ts';
const destDir = './executors/generate/_copiedFromCore';
const destPropertyFile = '/eventTypes.ts';
copyFileWithTSNoCheck(srcPropertyKeys, destDir, destPropertyFile);
