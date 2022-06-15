const fs = require('fs');
const path = require('path');
const { minify } = require('csso');

const scriptName = path.basename(__filename);

const distFolder = __dirname;
const outputFileName = "_css-content.scss"
const outputFile = path.join(distFolder, outputFileName);

const cssFiles = fs.readdirSync(distFolder)
    .filter(file => !file.endsWith(".min.css"))
    .filter(file => file.endsWith(".css"));

// sanity check built files are present
if (!cssFiles.includes("ag-theme-alpine.css")) {
    console.error(`ag-theme-alpine.css not present, somehow ${scriptName} has run before the build`);
    process.exit(1);
}
if (!cssFiles.includes("agGridAlpineFont.css")) {
    console.error(`agGridAlpineFont.css not present, somehow ${scriptName} has run before the build`);
    process.exit(1);
}

const fileBlocks = cssFiles
    .map((file, index) => {
        const content = fs.readFileSync(path.join(distFolder, file), "utf8");
        const operator = index === 0 ? "@if" : "@else if";
        return `
    ${operator} $file == "${file}" {
        ${content.replace(/\n/g, "\n        ")}
    }`;
    })
    .join("");

for (const file of cssFiles) {
    const content = fs.readFileSync(file, "utf8");
    const minifiedContent = minify(content).css;
    const miniffiedName = file.replace(/\.css$/, ".min.css");
    fs.writeFileSync(miniffiedName, minifiedContent, "utf8");
}

const content = `
// THIS FILE IS GENERATED, DO NOT EDIT IT!

// Output the content of a compiled CSS file, where $file is one of:
//     - ${cssFiles.join("\n//     - ")}
@mixin output-css-file($file, $ignore-missing: false) {
    ${fileBlocks}
    @else if not $ignore-missing {
        @error "No such file #{$file}, try one of: ${cssFiles.join(", ")}";
    }
}
`;

fs.writeFileSync(outputFile, content, "utf8");
console.log(`Built ${cssFiles.length} CSS files into ${outputFileName} (${cssFiles.join(", ")})`);
