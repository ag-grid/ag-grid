/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const { minify } = require('csso');

/*
 * the first half of this file is the original post processing to add sanity checks, rename minified files and add
 * generated content warning
 *
 * the second half fixes an issue where create-react-app can't consume our generated css
 */

const scriptName = path.basename(__filename);

const distFolder = __dirname;
const outputFileName = '_css-content.scss';
const outputFile = path.join(distFolder, outputFileName);

const cssFiles = fs
    .readdirSync(distFolder)
    .filter((file) => !file.endsWith('.min.css'))
    .filter((file) => file.endsWith('.css'));

// sanity check built files are present
if (!cssFiles.includes('ag-theme-quartz.css')) {
    console.error(`ag-theme-quartz.css not present, somehow ${scriptName} has run before the build`);
    process.exit(1);
}
if (!cssFiles.includes('agGridQuartzFont.css')) {
    console.error(`agGridQuartzFont.css not present, somehow ${scriptName} has run before the build`);
    process.exit(1);
}

const fileBlocks = cssFiles
    .map((file, index) => {
        const content = fs.readFileSync(path.join(distFolder, file), 'utf8');
        const operator = index === 0 ? '@if' : '@else if';
        return `
    ${operator} $file == "${file}" {
        ${content.replace(/\n/g, '\n        ')}
    }`;
    })
    .join('');

for (const file of cssFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const minifiedContent = minify(content).css;
    const miniffiedName = file.replace(/\.css$/, '.min.css');
    fs.writeFileSync(miniffiedName, minifiedContent, 'utf8');
}

const content = `
// THIS FILE IS GENERATED, DO NOT EDIT IT!

// Output the content of a compiled CSS file, where $file is one of:
//     - ${cssFiles.join('\n//     - ')}
@mixin output-css-file($file, $ignore-missing: false) {
    ${fileBlocks}
    @else if not $ignore-missing {
        @error "No such file #{$file}, try one of: ${cssFiles.join(', ')}";
    }
}
`;

fs.writeFileSync(outputFile, content, 'utf8');
console.log(`Built ${cssFiles.length} CSS files into ${outputFileName} (${cssFiles.join(', ')})`);

// ----------------------------------------------------------------------------------------------------
/*
 * Due to issues with create-react-app (CRA) 3.x and 4.x we have to post process some of the css files so that users of CRA 3/4 can consume our CSS
 * https://ag-grid.atlassian.net/browse/AG-7222
 */
/*
const directory = path.resolve(__dirname);
glob.sync(`${directory}/!*.css`, {ignore: ["**!/!*.min.css"]}).forEach(file => {
    const contents = fs.readFileSync(file, {encoding: "utf8"});

    const regex = /(?<prefix>.*min\(var\(.*calc\(.*)(?<value>var\(.*)(?<postfix>\);)/
    const initialMatch = contents.match(regex);
    if (initialMatch) {
        const newContents = contents.split("\n").map(line => {
            const match = line.match(regex);
            if (match &&
                match.groups.prefix &&
                match.groups.value &&
                match.groups.postfix) {
                const {prefix, value, postfix} = match.groups;

                return `${prefix}${value.replace(/ /g, '')}${postfix}`;
            }

            return line;
        })

        fs.writeFileSync(`${file}`, newContents.join('\n'), {encoding: "utf8"})
    }
})



*/
