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

function copyJsonFile(sourceFile, destinationFile) {
    fs.readFile(sourceFile, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file: ${err}`);
            return;
        }

        // Prepend '@ts-nocheck' to the content so we don't have to worry about typescript errors
        const modifiedContent = `export const moduleConfig = ${data}`;
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

const srcPropertyKeys = '../../community-modules/core/src/propertyKeys.ts';
const destPropertyKeys = './src/executors/generate/generator/_copiedFromCore/propertyKeys.ts';

const srcEventKeys = '../../community-modules/core/src/eventKeys.ts';
const destEventKeys = './src/executors/generate/generator/_copiedFromCore/eventKeys.ts';

const srcModules = '../../documentation/ag-grid-docs/src/content/matrix-table/modules.json';
const destModules = './src/executors/generate/generator/_copiedFromCore/modules.ts';

copyFile(srcPropertyKeys, destPropertyKeys);
copyFile(srcEventKeys, destEventKeys);
copyJsonFile(srcModules, destModules);
