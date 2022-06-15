const fs = require('fs');
const path = require('path');
const scriptName = path.basename(__filename);

const distFolder = __dirname;
const outputFileName = "_css-content.scss"
const outputFile = path.join(distFolder, outputFileName);

const cssFiles = fs.readdirSync(distFolder).filter(file => file.endsWith(".css"));

// sanity check built files are present
if (!cssFiles.includes("ag-theme-alpine.css")) {
    console.error(`ag-theme-alpine.css not present, somehow ${scriptName} has run before the build`);
    process.exit(1);
}
if (!cssFiles.includes("agGridAlpineFont.css")) {
    console.error(`agGridAlpineFont.css not present, somehow ${scriptName} has run before the build`);
    process.exit(1);
}

const mixins = cssFiles
    .map((file, index) => {
        const content = fs.readFileSync(path.join(distFolder, file), "utf8");
        const operator = index === 0 ? "@if" : "@else if";
        return `
    ${operator} $file == "${file}" {
        ${content.replace(/\n/g, "\n        ")}
    }`;
    })
    .join("");

const content = `
// THIS FILE IS GENERATED, DO NOT EDIT IT!

// Output the content of a compiled CSS file, where $file is one of:
//     - ${cssFiles.join("\n//     - ")}
@mixin output-css-file($file, $ignore-missing: false) {
    ${mixins}
    @else if not $ignore-missing {
        @error "No such file #{$file}, try one of: ${cssFiles.join(", ")}";
    }
}
`;

fs.writeFileSync(outputFile, content, "utf8");
console.log(`Built ${cssFiles.length} CSS files into ${outputFileName} (${cssFiles.join(", ")})`);
