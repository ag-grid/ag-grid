const {JSDOM} = require('jsdom');
const {window, document} = new JSDOM('<html></html>');
global.window = window;
global.document = document;
const jQuery = require('jquery');

const glob = require('glob');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const copy = require('copy');

const prettier = require('prettier');

function phpArrayToJSON(string) {
    if (!string) {
        return {};
    }
    const replaced = string
        .replace(/^, /, '')
        .replace(/'/g, '"')
        .replace(/array\(("\w+"(, )?)+\)/, '[$1]')
        .replace(/array/g, '')
        .replace(/\(/g, '{')
        .replace(/\)/g, '}')
        .replace(/\=\>/g, ':');
    try {
        return JSON.parse(replaced);
    } catch (e) {
        console.error(replaced, e);
        throw new Error(' The hackish conversion of PHP syntax to JSON failed. check ./exmaple-generator.js');
    }
}
function forEachExampleToGenerate(cb, final) {
    glob('src/*/*.php', {}, (er, files) => {

        files.forEach(file => {
            const contents = fs.readFileSync(file, {encoding: 'utf8'});
            const section = path.dirname(file).replace('src/', '');
            const exampleRegEx = /example\('.+?',\s?'(.+?)',\s?'(.+?)'(.+)?\)\s?\?>/g;

            let matches;
            while ((matches = exampleRegEx.exec(contents))) {
                const [_, example, type, options] = matches;

                if (type === 'generated') {
                    cb(section, example, phpArrayToJSON(options));
                }
            }
        });
        final();
    });
}
module.exports = cb => {
    require('ts-node').register();
    const {vanillaToReact} = require('./src/example-runner/vanilla-to-react.ts');
    const {vanillaToAngular} = require('./src/example-runner/vanilla-to-angular.ts');

    const appModuleTS = fs.readFileSync(path.join('./src', 'example-runner', 'angular-generated-app-module.ts'));

    let count = 0;
    forEachExampleToGenerate((section, example, options) => {
        count ++;
        const document = glob.sync(path.join('./src', section, example, 'index.html'))[0];
        const script = glob.sync(path.join('./src', section, example, '*.js'))[0];
        const stylesGlob = path.join('./src', section, example, '*.css');
        const sources = [fs.readFileSync(script, {encoding: 'utf8'}), fs.readFileSync(document, {encoding: 'utf8'})];
        const _gen = path.join('./src', section, example, '_gen');

        let source, indexJSX, appComponentTS;

        let inlineStyles;
        const style = jQuery(`<div>${sources[1]}</div>`).find('style');

        if (style.length) {
            inlineStyles = prettier.format(style.text(), { parser: 'css' });
        }


        try {
            source = vanillaToReact(sources, options);
            indexJSX = prettier.format(source, {printWidth: 120});
        } catch (e) {
            console.error(`Failed at ./src/${section}/${example}`, e);
            // console.error(source);
            //throw new Error('Failed generating the react version');
        }

        try {
            source = vanillaToAngular(sources, options);
            appComponentTS = prettier.format(source, {printWidth: 120, parser: 'typescript'});
        } catch (e) {
            console.error(`Failed at ./src/${section}/${example}`, e);
            // console.error(source);
            // throw new Error('Failed generating the angular version');
        }

        const reactPath = path.join(_gen, 'react');
        mkdirp(reactPath, () => {
            fs.writeFileSync(path.join(reactPath, 'index.jsx'), indexJSX);
            if (inlineStyles) {
                fs.writeFileSync(path.join(reactPath, 'styles.css'), inlineStyles);
            }
            copy(stylesGlob, reactPath, () => {});
        });

        const angularPath = path.join(_gen, 'angular');
        mkdirp(path.join(angularPath, 'app'), () => {
            fs.writeFileSync(path.join(angularPath, 'app', 'app.component.ts'), appComponentTS);
            fs.writeFileSync(path.join(angularPath, 'app', 'app.module.ts'), appModuleTS);
            if (inlineStyles) {
                fs.writeFileSync(path.join(angularPath, 'styles.css'), inlineStyles);
            }
            copy(stylesGlob, angularPath, () => {});
        });

        const vanillaPath = path.join(_gen, 'vanilla');

        mkdirp(vanillaPath, () => {
            const srcFilesGlob = path.join('./src', section, example, '*.{html,js,css}');
            copy(srcFilesGlob, vanillaPath, () => {});
        });
    }, () => {
        console.log(`// ${count} examples generated`);
        cb();
    });


};
