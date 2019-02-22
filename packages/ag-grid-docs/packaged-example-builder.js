const glob = require('glob');
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

SUPPORTED_TYPES = {
    'react-packaged': {
        main: 'index.jsx'
    },
    'angular-packaged': {
        main: 'src/app.ts'
    },
    'vue-packaged': {
        main: 'src/main.js'
    }
};

module.exports = (final, scope = '*') => {
    const workQueue = [];
    glob(`src/${scope}/*.php`, {}, (er, files) => {
        files.forEach(file => {
            const contents = fs.readFileSync(file, {encoding: 'utf8'});
            const section = path.dirname(file).replace('src/', '');
            const exampleRegEx = /example\('.+?',\s?'(.+?)',\s?'(.+?)'(.+)?\)\s?\?>/g;

            let matches;
            while ((matches = exampleRegEx.exec(contents))) {
                const [example, type, options] = matches.slice(1);

                if (!SUPPORTED_TYPES[type]) {
                    continue;
                }

                const exampleRoot = `src/${section}/${example}`;
                console.log(`Pre-packaging ${exampleRoot}`);

                const config = phpArrayToJSON(options);

                const fwType = type.replace('-packaged', '');
                const webpackConfig = require(`./src/example-runner/packaged-builds/${fwType}/webpack.config.js`);

                const absoluteRoot = path.resolve(__dirname, exampleRoot);

                webpackConfig.entry = `${absoluteRoot}/${SUPPORTED_TYPES[type].main}`;
                webpackConfig.output = { path: `${absoluteRoot}/prebuilt/`, filename: `bundle.js`};

                const workItem = new Promise((resolve) => {
                    const compiler = webpack(webpackConfig);

                    compiler.run((err, stats) => {
                        if (err) {
                            console.error(err.stack || err);
                            if (err.details) {
                                console.error(err.details);
                            }
                            return;
                        }

                        const info = stats.toJson();

                        if (stats.hasErrors()) {
                            console.error(info.errors);
                        }

                        // add any required extras (fontawesome etc)
                        const extras = getExtras(config.extras, fs.existsSync(`${absoluteRoot}/style.css`));

                        const htmlFile = `${exampleRoot}/prebuilt/index.html`;
                        const html = fs.readFileSync(htmlFile).toString();

                        fs.writeFileSync(htmlFile,
                            html.replace(/<!--EXTRAS-->/g, extras),
                            'utf8');

                        resolve();
                    });
                });

                workQueue.push(workItem);
            }
        });
        Promise.all(workQueue).then(final);
    });
};

function getExtras(extras, hasAppStyle) {
    if(!extras) {
        return "";
    }

    if(extras.bootstrap) {
        extras.jquery = true;
    }
    if(extras.jqueryui) {
        extras.jquery = true;
    }


    const stylesheets = [];
    const scripts = [];

    for (const extra of extras) {
        if (EXTRAS[extra].styles) {
            for (const stylesheet of EXTRAS[extra].styles) {
                stylesheets.push(`<link rel="stylesheet" href="${stylesheet}"/>`);
            }
        }
        if(EXTRAS[extra].scripts) {
            for (const script of EXTRAS[extra].scripts) {
                scripts.push(`<script src="${script}"></script>`);
            }
        }
    }

    if(hasAppStyle) {
        stylesheets.push('<link rel="stylesheet" href="style.css"/>');
    }

    return stylesheets.join('\n')
        .concat(
            scripts.join('\n')
        );
}

function phpArrayToJSON(string) {
    if (!string) {
        return {};
    }

    const replaced = string
        .replace(/^, /, '')
        .replace(/'/g, '"')
        .replace(/array\((("\w+"(, )?)+)\)/, '[$1]')
        .replace(/array/g, '')
        .replace(/\(/g, '{')
        .replace(/\)/g, '}')
        .replace(/=>/g, ':');
    try {
        return JSON.parse(replaced);
    } catch (e) {
        console.error(replaced, e);
        throw new Error(' The hackish conversion of PHP syntax to JSON failed. check ./example-generator.js');
    }
}

// !!!! IF YOU UPDATE THIS PLEASE UPDATE src/example-runner/utils.php
const EXTRAS = {
    'xlsx': {
        scripts: ['https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.10.3/xlsx.core.min.js']
    },
    'jquery': {
        'scripts': ['https://cdnjs.cloudflare.com/ajax/libs/jquery/1.12.1/jquery.min.js']
    },
    'jqueryui': {
        'scripts': ['https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js'],
        'styles': ['https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.css']
    },
    'rxjs': {
        'scripts': ['https://cdnjs.cloudflare.com/ajax/libs/rxjs/5.4.0/Rx.min.js']
    },
    'lodash': {
        'scripts': ['https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js']
    },
    'd3': {
        'scripts': ['https://d3js.org/d3.v4.min.js']
    },
    'sparkline': {
        'scripts': ['https://cdnjs.cloudflare.com/ajax/libs/jquery-sparklines/2.1.2/jquery.sparkline.min.js']
    },
    'bootstrap': {
        'scripts': ['https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/js/bootstrap.min.js'],
        'styles': [
            'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css',
            'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap-theme.min.css'
        ]
    },
    'flatpickr': {
        'scripts': ['https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.5.2/flatpickr.min.js'],
        'styles': [
            'https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.5.2/flatpickr.min.css',
            'https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.5.2/themes/material_blue.css'
        ]
    },
    'roboto': {
        'styles': [
            'https://fonts.googleapis.com/css?family=Roboto'
        ]
    },
    'fontawesome': {
        'styles': ['https://use.fontawesome.com/releases/v5.6.3/css/all.css']
    },
    'xlsx-style': {
        'scripts': ['https://unpkg.com/xlsx-style@0.8.13/dist/xlsx.full.min.js']
    },
    'angularjs1': {
        'scripts': [
            'https://ajax.googleapis.com/ajax/libs/angularjs/1.6.1/angular.min.js'
        ]
    },
    'ui-bootstrap': {
        'scripts': [
            '//angular-ui.github.io/bootstrap/ui-bootstrap-tpls-2.5.0.js'
        ],
        'styles': [
            '//netdna.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css'
        ]
    },
    'materialdesign': {
        'styles': [
            'https://unpkg.com/@angular/material/prebuilt-themes/indigo-pink.css',
            'https://fonts.googleapis.com/icon?family=Material+Icons'
        ]
    },
    'ngx-bootstrap': {
        'styles': [
            'https://unpkg.com/bootstrap/dist/css/bootstrap.min.css'
        ]
    }
};

