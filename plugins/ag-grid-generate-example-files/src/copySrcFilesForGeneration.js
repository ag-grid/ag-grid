/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');

function copyFile(sourceFile, destinationFile, addTsNoCheck = true) {
    fs.readFile(sourceFile, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file: ${err}`);
            return;
        }

        // Prepend '@ts-nocheck' to the content so we don't have to worry about typescript errors
        const modifiedContent = addTsNoCheck ? `// @ts-nocheck\n${data}` : data;
        fs.writeFile(
            destinationFile,
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

const srcPropertyKeys = '../../packages/ag-grid-community/src/propertyKeys.ts';
const destPropertyKeys = './src/executors/generate/generator/_copiedFromCore/propertyKeys.ts';

const srcEventKeys = '../../packages/ag-grid-community/src/eventTypes.ts';
const destEventKeys = './src/executors/generate/generator/_copiedFromCore/eventTypes.ts';

copyFile(srcPropertyKeys, destPropertyKeys);
copyFile(srcEventKeys, destEventKeys);
