const fs = require('fs');
const glob = require('glob');
const webfontsGenerator = require('@vusion/webfonts-generator');
const mkdirp = require('mkdirp');

const formats = ['woff', 'ttf'];
const mimeTypes = {
    eot: 'application/vnd.ms-fontobject',
    svg: 'image/svg+xml',
    ttf: 'application/x-font-ttf',
    woff: 'application/font-woff',
    woff2: 'font/woff2'
};

// find names of themes with an icons folder
const themes = glob.sync('ag-theme-*/icons')
        .map(item => item.replace('ag-theme-', '').replace('/icons', ''));

const generate = (theme) => {
    const fontName = theme === 'base'
        ? 'agGridClassic'
        : ('agGrid' + theme[0].toUpperCase() + theme.substring(1));
    const themeFolder = `ag-theme-${theme}`;
    const destFolder = `${themeFolder}/vars/`;
    console.log(`Generating webFont for ${theme} theme into ${destFolder}`)
    webfontsGenerator(
        {
            files: glob.sync(`${themeFolder}/icons/*.svg`),
            writeFiles: false,
            scssFile: true,
            fontName: fontName,
            fontHeight: 1000,
            templateOptions: {
                classPrefix: 'ag-icon-',
                baseSelector: '.ag-icon'
            },
            types: formats,
            fixedWidth: false,
            dest: destFolder,
            cssTemplate: './scss-template.hbs'
        },
        (err, res) => {
            if (err) {
                console.log(err);
                process.exit();
            }

            var urls = {};
            for (var i in formats) {
                var format = formats[i];
                urls[format] = 'data:' + mimeTypes[format] + ';charset=utf-8;base64,' + Buffer.from(res[format]).toString('base64');
            }

            const scssContents = res.generateCss(urls);

            mkdirp.sync(destFolder);
            fs.writeFileSync(destFolder + '/_font-vars.scss', scssContents);
        }
    );
}

const theme = process.argv[2];

if (!theme) {
    themes.forEach(generate);
} else {
    if (themes.includes(theme)) {
        generate(theme);
    } else {
        console.error(`No such theme '${theme}', try one of: ${themes.join(', ')}.`);
    }
}