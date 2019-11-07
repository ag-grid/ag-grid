const fs = require('fs');
const webfontsGenerator = require('@vusion/webfonts-generator');
const mkdirp = require('mkdirp');

const formats = ['woff', 'ttf'];
var mimeTypes = {
    eot: 'application/vnd.ms-fontobject',
    svg: 'image/svg+xml',
    ttf: 'application/x-font-ttf',
    woff: 'application/font-woff',
    woff2: 'font/woff2'
};

webfontsGenerator(
    {
        files: fs.readdirSync('./icons/').map(icon => `./icons/${icon}`),
        writeFiles: false,
        scssFile: true,
        fontName: 'agGridClassic',
        fontHeight: 1000,
        templateOptions: {
            classPrefix: 'ag-icon-',
            baseSelector: '.ag-icon'
        },
        types: formats,
        fixedWidth: false,
        dest: '../vars/',
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

        mkdirp.sync('../vars/');
        fs.writeFileSync('../vars/_font-vars.scss', scssContents);
    }
);