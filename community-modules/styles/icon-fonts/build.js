/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const webfontsGenerator = require('@vusion/webfonts-generator');

const fontDataFolder = path.join(__dirname, '../src/internal/ag/generated');
const iconMapFolder = path.join(__dirname, '..');

const fonts = fs.readdirSync(path.join(__dirname, 'fonts')).filter((f) => !f.startsWith('.'));

// NOTE: this map of icon names to codepoints is documented and customers may
// depend on it not changing. Add new codepoints but don't alter existing ones.
const nameToCodepoint = {
    aggregation: 0xf101,
    arrows: 0xf102,
    asc: 0xf103,
    cancel: 0xf104,
    chart: 0xf105,
    'checkbox-checked': 0xf106,
    'checkbox-indeterminate': 0xf107,
    'checkbox-unchecked': 0xf108,
    'color-picker': 0xf109,
    columns: 0xf10a,
    contracted: 0xf10b,
    copy: 0xf10c,
    cross: 0xf10d,
    csv: 0xf10e,
    cut: 0xf10f,
    desc: 0xf110,
    excel: 0xf111,
    expanded: 0xf112,
    'eye-slash': 0xf113,
    eye: 0xf114,
    filter: 0xf115,
    first: 0xf116,
    grip: 0xf117,
    group: 0xf118,
    last: 0xf119,
    left: 0xf11a,
    linked: 0xf11b,
    loading: 0xf11c,
    maximize: 0xf11d,
    menu: 0xf11e,
    minimize: 0xf11f,
    next: 0xf120,
    none: 0xf121,
    'not-allowed': 0xf122,
    paste: 0xf123,
    pin: 0xf124,
    pivot: 0xf125,
    previous: 0xf126,
    'radio-button-off': 0xf127,
    'radio-button-on': 0xf128,
    right: 0xf129,
    save: 0xf12a,
    'small-down': 0xf12b,
    'small-left': 0xf12c,
    'small-right': 0xf12d,
    'small-up': 0xf12e,
    tick: 0xf12f,
    'tree-closed': 0xf130,
    'tree-indeterminate': 0xf131,
    'tree-open': 0xf132,
    unlinked: 0xf133,
    up: 0xf134,
    down: 0xf135,
    plus: 0xf136,
    minus: 0xf137,
    'menu-alt': 0xf138,
    settings: 0xf139,
};

function generateFontFile(fontName) {
    const sourceFolder = path.join(__dirname, `fonts/${fontName}`);
    const files = Object.keys(nameToCodepoint).map((name) => path.join(sourceFolder, name + '.svg'));

    webfontsGenerator(
        {
            files: files,
            writeFiles: false,
            fontName: fontName,
            fontHeight: 1000,
            types: ['woff2'],
            css: false,
            fixedWidth: true,
            dest: path.join(__dirname, '..'),
            codepoints: nameToCodepoint,
        },
        (err, res) => {
            if (err) {
                console.log(err);
                process.exit(1);
            }
            const cssFile = path.join(fontDataFolder, `_${fontName}.scss`);
            fs.writeFileSync(cssFile, getIconDataFileContent(res.woff2), 'utf8');
            console.log(`Generated ${cssFile}`);
        }
    );
}

// This can be used to generate embedded SVG versions of each icon font
// function generateScssFile(fontName) {
//     const fontClass = fontName.replace("agGrid", "").toLowerCase();
//     const sourceFolder = path.join(__dirname, `fonts/${fontName}`);
//     let scssContent = `// THIS FILE IS GENERATED, DO NOT EDIT IT!\n\n[class*="ag-theme-${fontClass}"] {\n`;
//     for (const name of Object.keys(nameToCodepoint)) {
//         let content = fs.readFileSync(path.join(sourceFolder, name + '.svg'), "utf8");
//         content = encodeURIComponent(content);
//         // content = content.replaceAll(/>\s+</g, "><").replaceAll(/\s+/g, "+").replaceAll(/[/#\s"']/g, encodeURIComponent)
//         scssContent += `\t--ag-icon-image-${name}: url("data:image/svg+xml;charset=utf-8,${content}");\n`;
//     }
//     scssContent += "}\n";
//     const scssFile = path.join(fontDataFolder,  `_${kebabCase(fontName)}-embedded-svg.scss`);
//     fs.writeFileSync(scssFile, scssContent, "utf8");
// }

// const kebabCase = (camelCase) => camelCase.replaceAll(/[A-Z]/g, (letter) => '-' + letter.toLowerCase());

const getIconDataFileContent = (buffer) => `
// THIS FILE IS GENERATED, DO NOT EDIT IT!
$data: "data:font/woff2;charset=utf-8;base64,${Buffer.from(buffer).toString('base64')}";
`;

const generateScssIconMap = () => {
    const outputFile = path.join(iconMapFolder, '_icon-font-codes.scss');
    console.log(`Generating ${outputFile}`);
    fs.writeFileSync(outputFile, getIconFontCodeScss(), 'utf8');
};

const getIconFontCodeScss = () => `
// THIS FILE IS GENERATED, DO NOT EDIT IT!
@use "sass:string";
$icon-font-codes: (
${Object.keys(nameToCodepoint)
    .map(
        (iconName) =>
            `    ${iconName}: string.unquote("\\"\\\\") + string.unquote("${nameToCodepoint[iconName].toString(16)}\\""),`
    )
    .join('\n')}
)
`;

if (!fs.existsSync(fontDataFolder)) {
    fs.mkdirSync(fontDataFolder);
}

generateScssIconMap();
fonts.forEach(generateFontFile);
// fonts.forEach(generateScssFile);
