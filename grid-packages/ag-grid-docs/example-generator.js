const {JSDOM} = require('jsdom');
const {window, document} = new JSDOM('<html></html>');

window.Date = Date;
global.window = window;
global.document = document;

const jQuery = require('jquery');
const glob = require('glob');
const fs = require('fs');
const path = require('path');
const prettier = require('prettier');

function copyFilesSync(files, dest, tokenToRemove) {
    files.forEach(sourceFile => {
        const filename = path.basename(sourceFile);
        const destinationFile = path.join(dest, tokenToRemove ? filename.replace(tokenToRemove, '') : filename);
        const extension = path.extname(sourceFile).slice(1);
        const parsers = {
            js: 'babel',
            jsx: 'babel',
            ts: 'typescript',
        };

        const parser = parsers[extension] || extension;
        const content = format(getFileContents(sourceFile), parser);

        fs.writeFileSync(destinationFile, content, 'utf8');
    });
}

// childMessageRenderer_react.jsx -> childMessageRenderer.jsx
// childMessageRenderer_angular.ts -> childMessageRenderer.ts
function extractComponentFileNames(scripts, token) {
    return scripts.map(script => path.basename(script).replace(token, ''));
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
        throw new Error('The hackish conversion of PHP syntax to JSON failed. Check ./example-generator.js');
    }
}

function getFileContents(path) {
    return fs.readFileSync(path, {encoding: 'utf8'});
}

function forEachExample(done, name, regex, generateExample, scope = '*') {
    glob(`src/${scope}/*.php`, {}, (_, files) => {
        const startTime = Date.now();
        let count = 0;

        files.forEach(file => {
            const contents = getFileContents(file);
            const section = path.dirname(file).replace('src/', '');

            let matches;

            while ((matches = regex.exec(contents))) {
                const [example, type, options] = matches.slice(1);

                if (type === 'generated') {
                    try {
                        const examplePath = path.join('./src', section, example);
                        generateExample(examplePath, phpArrayToJSON(options));
                        count++;
                    } catch (error) {
                        console.error(`Could not process example ${example} in ${file}. Does the example directory exist?`);
                        console.error(`Error: ${error.message}`);
                    }
                }
            }
        });

        console.log(`-> ${count} ${name} example${count === 1 ? '' : 's'} generated in ${Date.now() - startTime}ms.`);
        if (done) {
            done();
        }
    });
}

const format = (source, parser) => prettier.format(source, {parser, singleQuote: true, trailingComma: 'es5'});

function createExampleGenerator(prefix) {
    const [parser, vanillaToVue, vanillaToReact, vanillaToAngular, appModuleAngular] = getGeneratorCode(prefix);

    return (examplePath, options) => {
        //    src section                        example        glob
        // eg src/javascript-grid-accessing-data/using-for-each/*.js
        const createExamplePath = pattern => path.join(examplePath, pattern);
        const getMatchingPaths = (pattern, options = {}) => glob.sync(createExamplePath(pattern), options);

        const document = getMatchingPaths('index.html')[0];
        let scripts = getMatchingPaths('*.js');
        let mainScript = scripts[0];

        if (scripts.length > 1) {
            // multiple scripts - main.js is the main one, the rest are supplemental
            mainScript = getMatchingPaths('main.js')[0];

            // get the rest of the scripts
            scripts = getMatchingPaths('*.js', {ignore: ['**/main.js', '**/*_{angular,react,vanilla,vue}.js']});
        } else {
            // only one script, which is the main one
            scripts = [];
        }

        // any associated css
        const stylesheets = getMatchingPaths('*.css');

        // read the main script (js) and the associated index.html
        const mainJs = getFileContents(mainScript);
        const indexHtml = getFileContents(document);
        const bindings = parser(mainJs, indexHtml, options);

        // this examples _gen directory
        const _gen = createExamplePath('_gen');

        // inline styles in the examples index.html
        // will be added to styles.css in the various generated fw examples
        const style = jQuery(`<div>${indexHtml}</div>`).find('style');
        let inlineStyles = style.length > 0 && format(style.text(), 'css');

        const reactScripts = getMatchingPaths('*_react*');
        let indexJSX;

        try {
            const source = vanillaToReact(bindings, extractComponentFileNames(reactScripts, '_react'));

            indexJSX = format(source, 'babel');
        } catch (e) {
            console.error(`Failed to process React example in ${examplePath}`, e);
            throw e;
        }

        const angularScripts = getMatchingPaths('*_angular*');
        const angularComponentFileNames = extractComponentFileNames(angularScripts, '_angular');
        let appComponentTS, appModuleTS;

        try {
            const source = vanillaToAngular(bindings, angularComponentFileNames);

            appComponentTS = format(source, 'typescript');
            appModuleTS = format(appModuleAngular(angularComponentFileNames), 'typescript');
        } catch (e) {
            console.error(`Failed to process Angular example in ${examplePath}`, e);
            throw e;
        }

        const vueScripts = getMatchingPaths('*_vue*');
        let mainApp;

        try {
            // vue is still new - only process examples marked as tested and good to go
            // when all examples have been tested this check can be removed
            if (options.processVue || options.processVue === undefined) {
                const source = vanillaToVue(bindings, extractComponentFileNames(vueScripts, '_vue'));

                mainApp = format(source, 'babel');
            }
        } catch (e) {
            console.error(`Failed to process Vue example in ${examplePath}`, e);
            throw e;
        }

        const writeExampleFiles = (framework, frameworkScripts, files, subdirectory) => {
            const basePath = path.join(_gen, framework);
            const scriptsPath = subdirectory ? path.join(basePath, subdirectory) : basePath;

            fs.mkdirSync(scriptsPath, {recursive: true});

            Object.keys(files).forEach(name => {
                fs.writeFileSync(path.join(scriptsPath, name), files[name], 'utf8');
            });

            if (inlineStyles) {
                fs.writeFileSync(path.join(basePath, 'styles.css'), inlineStyles, 'utf8');
            }

            copyFilesSync(stylesheets, basePath);
            copyFilesSync(scripts, basePath);
            copyFilesSync(frameworkScripts, scriptsPath, `_${framework}`);
        };

        writeExampleFiles('react', reactScripts, {'index.jsx': indexJSX});

        writeExampleFiles('angular', angularScripts, {
            'app.component.ts': appComponentTS,
            'app.module.ts': appModuleTS,
        }, 'app');

        // vue is still new - only process examples marked as tested and good to go
        // when all examples have been tested this check can be removed
        if (options.processVue || options.processVue === undefined) {
            writeExampleFiles('vue', vueScripts, {'main.js': mainApp});
        }

        inlineStyles = undefined; // unset these as they don't need to be copied for vanilla

        const vanillaScripts = getMatchingPaths('*.{html,js}', {ignore: ['**/*_{angular,react,vue}.js']});
        writeExampleFiles('vanilla', vanillaScripts, {});

        // allow developers to override the example theme with an environment variable
        const themeOverride = process.env.AG_EXAMPLE_THEME_OVERRIDE;

        if (themeOverride) {
            const generatedFiles = glob.sync(path.join(_gen, '**/*.{html,js,jsx,ts}'));

            generatedFiles.forEach(file => {
                let content = getFileContents(file).replace(/ag-theme-balham/g, `ag-theme-${themeOverride}`);
                fs.writeFileSync(file, content, 'utf8');
            });
        }
    };
}

function getGeneratorCode(prefix) {
    const {parser} = require(`${prefix}vanilla-src-parser.ts`);
    const {vanillaToVue} = require(`${prefix}vanilla-to-vue.ts`);
    const {vanillaToReact} = require(`${prefix}vanilla-to-react.ts`);
    const {vanillaToAngular} = require(`${prefix}vanilla-to-angular.ts`);
    const {appModuleAngular} = require(`${prefix}angular-app-module.ts`);

    return [parser, vanillaToVue, vanillaToReact, vanillaToAngular, appModuleAngular];
}

function generateGridExamples(scope, done) {
    const exampleGenerator = createExampleGenerator('./src/example-runner/grid-');

    forEachExample(done, 'grid', /grid_example\('.+?',\s?'(.+?)',\s?'(.+?)'(.+)?\)\s?\?>/g, exampleGenerator, scope);
}

function generateChartExamples(scope, done) {
    const exampleGenerator = createExampleGenerator('./src/example-runner/chart-');

    forEachExample(done, 'chart', /chart_example\('.+?',\s?'(.+?)',\s?'(.+?)'(.+)?\)\s?\?>/g, exampleGenerator, scope);
}

module.exports.generateGridExamples = (scope, done) => {
    require('ts-node').register();
    generateGridExamples(scope, done);
};

module.exports.generateChartExamples = (scope, done) => {
    require('ts-node').register();
    generateChartExamples(scope, done);
};

module.exports.generateExamples = (scope) => {
    require('ts-node').register();
    generateGridExamples(scope);
    generateChartExamples(scope);
};
