const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Function to transform private methods
function transformPrivateMethods(fileContent) {
    // Regular expression to match private methods (#methodName)
    const privateMethodRegex = /private ([a-zA-Z]+)\(/g;

    let privateMethods = [];
    let transformedContent = fileContent;
    fileContent.replace(privateMethodRegex, (match, methodName, after) => {
        privateMethods.push(methodName);
        return `private ${methodName}_(`;
    });

    privateMethods = privateMethods.sort((a, b) => -1 * (a.length - b.length));
    privateMethods = [...new Set(privateMethods)];
    // console.log(privateMethods);
    // Replace private method (#methodName) with methodName_
    privateMethods.forEach((methodName) => {
        // private callMethod( => private callMethod_(
        const toReplace1 = `private ${methodName}(`;
        const withText1 = `private ${methodName}_(`;
        transformedContent = transformedContent.replaceAll(toReplace1, withText1);

        // generic methods
        const toReplace2 = `private ${methodName}<`;
        const withText2 = `private ${methodName}_<`;
        transformedContent = transformedContent.replaceAll(toReplace2, withText2);

        // this.callMethod( => this.callMethod_(
        const toReplace = `this.${methodName}(`;
        const withText = `this.${methodName}_(`;
        transformedContent = transformedContent.replaceAll(toReplace, withText);

        // callMethod.bind(this) => callMethod_.bind(this)
        const toR = `${methodName}.bind(this`;
        const withR = `${methodName}_.bind(this`;
        transformedContent = transformedContent.replaceAll(toR, withR);
    });

    return transformedContent;
}

function transformPrivateProperties(fileContent) {
    // Regular expression to match private methods (#methodName)
    const privatePropRegex = /private ([a-zA-Z]+)[:?]/g;

    let privateProps = [];
    let transformedContent = fileContent;
    fileContent.replace(privatePropRegex, (match, methodName, after) => {
        privateProps.push(methodName);
        return `private ${methodName}_:`;
    });

    privateProps = privateProps.sort((a, b) => -1 * (a.length - b.length));
    privateProps = [...new Set(privateProps)];
    // console.log(privateMethods);
    privateProps.forEach((methodName) => {
        // private callMethod( => private callMethod_(
        const toReplace1 = `private ${methodName}:`;
        const withText1 = `private ${methodName}_:`;
        transformedContent = transformedContent.replaceAll(toReplace1, withText1);

        const toReplace10 = `private ${methodName}?:`;
        const withText10 = `private ${methodName}_?:`;
        transformedContent = transformedContent.replaceAll(toReplace10, withText10);

        // this.callMethod( => this.callMethod_(
        const toReplace = `this.${methodName} `;
        const withText = `this.${methodName}_ `;
        transformedContent = transformedContent.replaceAll(toReplace, withText);

        // this.callMethod( => this.callMethod_(
        const toReplace2 = `this.${methodName}.`;
        const withText2 = `this.${methodName}_.`;
        transformedContent = transformedContent.replaceAll(toReplace2, withText2);

        // callMethod.bind(this) => callMethod_.bind(this)
        const toR = `this.${methodName}?`;
        const withR = `this.${methodName}_?`;
        transformedContent = transformedContent.replaceAll(toR, withR);

        const toR1 = `this.${methodName}!`;
        const withR1 = `this.${methodName}_!`;
        transformedContent = transformedContent.replaceAll(toR1, withR1);

        const toR2 = `this.${methodName}\n`;
        const withR2 = `this.${methodName}_\n`;
        transformedContent = transformedContent.replaceAll(toR2, withR2);

        const toR3 = `this.${methodName})`;
        const withR3 = `this.${methodName}_)`;
        transformedContent = transformedContent.replaceAll(toR3, withR3);

        const toR4 = `this.${methodName}]`;
        const withR4 = `this.${methodName}_]`;
        transformedContent = transformedContent.replaceAll(toR4, withR4);

        const toR5 = `this.${methodName},`;
        const withR5 = `this.${methodName}_,`;
        transformedContent = transformedContent.replaceAll(toR5, withR5);

        const toR6 = `this.${methodName};`;
        const withR6 = `this.${methodName}_;`;
        transformedContent = transformedContent.replaceAll(toR6, withR6);

        const toR7 = `this.${methodName}[`;
        const withR7 = `this.${methodName}_[`;
        transformedContent = transformedContent.replaceAll(toR7, withR7);

        const toR8 = `this.${methodName}(`;
        const withR8 = `this.${methodName}_(`;
        transformedContent = transformedContent.replaceAll(toR8, withR8);

        const toR9 = `this.${methodName}+`;
        const withR9 = `this.${methodName}_+`;
        transformedContent = transformedContent.replaceAll(toR9, withR9);

        const toR10 = `this.${methodName}-`;
        const withR10 = `this.${methodName}_-`;
        transformedContent = transformedContent.replaceAll(toR10, withR10);

        const toR11 = `this.${methodName}:`;
        const withR11 = `this.${methodName}_:`;
        transformedContent = transformedContent.replaceAll(toR11, withR11);
    });

    return transformedContent;
}

// Main function to process the file
function processFile(filePath) {
    // Read the file content
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file: ${err}`);
            return;
        }

        // Transform the content
        let transformedContent = transformPrivateMethods(data);
        transformedContent = transformPrivateProperties(transformedContent);

        // Write the transformed content back to the file (or a new file)
        // const outputFilePath = path.join(path.dirname(filePath), 'transformed' + path.basename(filePath)); //'transformed_'
        const outputFilePath = path.join(path.dirname(filePath), path.basename(filePath)); //'transformed_'
        fs.writeFile(outputFilePath, transformedContent, (err) => {
            if (err) {
                console.error(`Error writing file: ${err}`);
            } else {
                console.log(`File transformed and saved to: ${outputFilePath}`);
            }
        });
    });
}

// Specify the file path (you can replace this with your file path)
// const filePath = './packages/ag-grid-community/src/columns/columnFactory.ts'; // Replace with the file you want to transform
// processFile(filePath);

// Main function to process all files matching the glob pattern
function processFiles(pattern) {
    glob(pattern, (err, files) => {
        if (err) {
            console.error(`Error with glob pattern: ${err}`);
            return;
        }

        if (files.length === 0) {
            console.log('No files found matching the pattern.');
            return;
        }

        // Process each file
        files.forEach((file) => {
            processFile(file);
        });
    });
}

// Specify the glob pattern (you can replace this with your pattern)
// const globPattern = './packages/ag-grid-community/src/**/*.ts'; // Replace with your target folder and file extension
const globPattern = './packages/ag-grid-community/src/**/*.ts'; // Replace with the file you want to transform

// Process the matched files
processFiles(globPattern);
