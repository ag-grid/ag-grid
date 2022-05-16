const fs = require('fs');
const path = require('path');

const destFile = path.join(__dirname, "css-content.scss");

const mixins = fs.readdirSync(__dirname)
    .filter(file => file.endsWith(".css"))
    .map(file => {
        const content = fs.readFileSync(path.join(__dirname, file), "utf8");
        const name = file.replace(/.css$/, "");
        return `
@mixin ${name} {
    ${content.replace(/\n/g, "\n    ")}
}
`;
    })
    .join("\n\n");

const content = `
// THIS FILE IS GENERATED, DO NOT EDIT IT!
// To change the icon font code map, edit ${path.basename(__filename)}`;

`;

fs.writeFileSync(destFile, content, "utf8");
