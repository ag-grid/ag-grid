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
const fsExtra = require('fs-extra');

const prettier = require('prettier');

function copyFilesSync(files, dest) {
    files.forEach(file => fsExtra.copySync(file, dest + '/' + path.basename(file)));
}

function moveScriptsWithoutToken(scripts, dest, token) {
    let removeTokenFromFile = file => {
        let filename = path.basename(file);
        fsExtra.rename(dest + '/' + filename, dest + '/' + filename.replace(token, ''));
    };

    copyFilesSync(scripts, dest);
    scripts.forEach(file => removeTokenFromFile(file));
}

function extractComponentFileNames(scripts, token) {
    return scripts.map(script => path.basename(script).replace(token, ''));
}

function copyGlobSync(globString, dest) {
    copyFilesSync(glob.sync(globString), dest);
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
        .replace(/\=\>/g, ':');
    try {
        return JSON.parse(replaced);
    } catch (e) {
        console.error(replaced, e);
        throw new Error(' The hackish conversion of PHP syntax to JSON failed. check ./example-generator.js');
    }
}

function forEachExampleToGenerate(cb, final, scope = '*') {
    glob(`src/${scope}/*.php`, {}, (er, files) => {
        files.forEach(file => {
            const contents = fs.readFileSync(file, {encoding: 'utf8'});
            const section = path.dirname(file).replace('src/', '');
            const exampleRegEx = /example\('.+?',\s?'(.+?)',\s?'(.+?)'(.+)?\)\s?\?>/g;

            let matches;
            while ((matches = exampleRegEx.exec(contents))) {
                const [_, example, type, options] = matches;

                if (type === 'generated') {
                    try {
                        cb(section, example, phpArrayToJSON(options));
                    } catch (error) {
                        console.error(`Could not process example ${example } in ${file}. Does the example directory exist?`);
                        console.error(`The error: ${error.message}`);
                    }
                }
            }
        });
        final();
    });
}

module.exports = (cb, scope) =>     {
    require('ts-node').register();

    const {vanillaToVue} = require('./src/example-runner/vanilla-to-vue.ts');
    const {vanillaToReact} = require('./src/example-runner/vanilla-to-react.ts');
    const {vanillaToAngular} = require('./src/example-runner/vanilla-to-angular.ts');
    const {appModuleAngular} = require('./src/example-runner/angular-app-module.ts');

    let count = 0;
    forEachExampleToGenerate(
        (section, example, options) => {
            count++;
            const document = glob.sync(path.join('./src', section, example, 'index.html'))[0];
            let script, scripts;
            if (glob.sync(path.join('./src', section, example, '*.js')).length > 1) {
                script = glob.sync(path.join('./src', section, example, 'main.js'))[0];
                scripts = glob.sync(
                    path.join('./src', section, example, '*.js'),
                    {ignore: ['**/main.js', '**/*_angular.js', '**/*_react.js', '**/*_vanilla.js', '**/*_vue.js']}
                );
            } else {
                script = glob.sync(path.join('./src', section, example, '*.js'))[0];
                scripts = [];
            }

            const stylesGlob = path.join('./src', section, example, '*.css');
            const sources = [fs.readFileSync(script, {encoding: 'utf8'}), fs.readFileSync(document, {encoding: 'utf8'})];
            const _gen = path.join('./src', section, example, '_gen');

            let source, indexJSX, mainApp;

            let inlineStyles;
            const style = jQuery(`<div>${sources[1]}</div>`).find('style');

            if (style.length) {
                inlineStyles = prettier.format(style.text(), {parser: 'css'});
            }

            const reactScripts = glob.sync(path.join('./src', section, example, '*_react*'));
            try {
                source = vanillaToReact(sources, options, extractComponentFileNames(reactScripts, '_react'));
                indexJSX = prettier.format(source, {printWidth: 120});
            } catch (e) {
                console.error(`Failed at ./src/${section}/${example}`, e);
                return;
                // console.error(source);
                //throw new Error('Failed generating the react version');
            }

            const angularScripts = glob.sync(path.join('./src', section, example, '*_angular*'));
            let angularComponentFileNames = extractComponentFileNames(angularScripts, '_angular');
            let appComponentTS, appModuleTS;
            try {
                source = vanillaToAngular(sources, options, angularComponentFileNames);
                appComponentTS = prettier.format(source, {printWidth: 120, parser: 'typescript'});
                appModuleTS = prettier.format(appModuleAngular(angularComponentFileNames), {
                    printWidth: 120,
                    parser: 'typescript'
                });
            } catch (e) {
                console.error(`Failed at ./src/${section}/${example}`, e);
                return;
                // console.error(source);
                // throw new Error('Failed generating the angular version');
            }

            const vueScripts = glob.sync(path.join('./src', section, example, '*_vue*'));
            try {
                // vue is still new - only process examples marked as tested and good to go
                // when all examples have been tested this check can be removed
                if(options.processVue) {
                    console.log(`Processing Vue Example ${example}`);
                    source = vanillaToVue(sources, options, extractComponentFileNames(vueScripts, '_vue'));
                    mainApp = prettier.format(source, {printWidth: 120});
                }
            } catch (e) {
                console.error(`Failed at ./src/${section}/${example}`, e);
                // return;
                // console.error(source);
                // throw new Error('Failed generating the vue version');
            }

            // fetch and move react files to _gen/react
            const reactPath = path.join(_gen, 'react');
            mkdirp.sync(reactPath);
            fs.writeFileSync(path.join(reactPath, 'index.jsx'), indexJSX);
            if (inlineStyles) {
                fs.writeFileSync(path.join(reactPath, 'styles.css'), inlineStyles);
            }
            copyGlobSync(stylesGlob, reactPath);
            copyFilesSync(scripts, reactPath);
            moveScriptsWithoutToken(reactScripts, reactPath, '_react');

            // fetch and move angular files to _gen/angular
            const angularPath = path.join(_gen, 'angular');
            mkdirp.sync(path.join(angularPath, 'app'));
            fs.writeFileSync(path.join(angularPath, 'app', 'app.component.ts'), appComponentTS);
            fs.writeFileSync(path.join(angularPath, 'app', 'app.module.ts'), appModuleTS);
            if (inlineStyles) {
                fs.writeFileSync(path.join(angularPath, 'styles.css'), inlineStyles);
            }
            copyGlobSync(stylesGlob, angularPath);
            copyFilesSync(scripts, angularPath);
            moveScriptsWithoutToken(angularScripts, angularPath + '/app', '_angular');

            // vue is still new - only process examples marked as tested and good to go
            // when all examples have been tested this check can be removed
            if(options.processVue) {
                // fetch and move react files to _gen/vue
                const vuePath = path.join(_gen, 'vue');
                mkdirp.sync(vuePath);
                fs.writeFileSync(path.join(vuePath, 'main.js'), mainApp);
                copyGlobSync(stylesGlob, vuePath);
                copyFilesSync(scripts, vuePath);
                moveScriptsWithoutToken(vueScripts, vuePath, '_vue');
                if (inlineStyles) {
                    fs.writeFileSync(path.join(vuePath, 'styles.css'), inlineStyles);
                }
            }

            // fetch and move vanilla files to _gen/vanilla
            const vanillaPath = path.join(_gen, 'vanilla');
            mkdirp(vanillaPath);
            const vanillaScripts = glob.sync(
                path.join('./src', section, example, '*.{html,js,css}'),
                {ignore: ['**/*_angular.js', '**/*_react.js', '**/*_vue.js']}
            );
            moveScriptsWithoutToken(vanillaScripts, vanillaPath, '_vanilla');
        },
        () => {
            console.log(`// ${count} examples generated`);
            cb();
        }
        , scope);
};
