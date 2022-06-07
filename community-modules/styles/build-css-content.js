const fs = require('fs');
const path = require('path');

const distFolder = path.join(__dirname, "dist");

const outputFile = path.join(distFolder, "_css-content.scss");

const mixins = fs.readdirSync(distFolder)
    .filter(file => file.endsWith(".css"))
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
// To change the icon font code map, edit build-css-content.js
@mixin output-css-file($file) {
    ${mixins}
    @else {
        @error "No such file #{$file}";
    }
}
`;

fs.writeFileSync(outputFile, content, "utf8");
