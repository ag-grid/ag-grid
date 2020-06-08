const { JSDOM } = require('jsdom');
const { window, document } = new JSDOM('<!DOCTYPE html><html lang="en"></html>');

window.Date = Date;
global.window = window;
global.document = document;

const glob = require('glob');
const fs = require('fs');
const path = require('path');
const prettier = require('prettier');

function emptyDirectory(directory) {
    if (!directory || directory.trim().indexOf('/') === 0) { return; }

    try {
        const files = fs.readdirSync(directory);

        files.forEach(file => {
            const filePath = path.join(directory, file);

            if (fs.statSync(filePath).isFile()) {
                fs.unlinkSync(filePath);
            }
            else {
                emptyDirectory(filePath);
                fs.rmdirSync(filePath);
            }
        });
    }
    catch (e) {
        console.error(`Failed to empty ${directory}`, e);
        return;
    }
};

const extensionsToOverride = new Set(['html', 'js', 'jsx', 'ts']);
const parsers = {
    js: 'babel',
    jsx: 'babel',
    ts: 'typescript',
};

const useAsyncFileOperations = false;
const encodingOptions = { encoding: 'utf8' };

function writeFile(destination, contents) {
    // allow developers to override the example theme with an environment variable
    const themeOverride = process.env.AG_EXAMPLE_THEME_OVERRIDE;

    if (themeOverride && extensionsToOverride.has(path.extname(destination).slice(1))) {
        contents = contents.replace(/ag-theme-alpine/g, `ag-theme-${themeOverride}`);
    }

    const extension = path.extname(destination).slice(1);
    const parser = parsers[extension] || extension;
    const formattedContent = format(contents, parser);

    if (useAsyncFileOperations) {
        fs.writeFile(destination, formattedContent, encodingOptions, () => { });
    } else {
        fs.writeFileSync(destination, formattedContent, encodingOptions);
    }
}

function copyFiles(files, dest, tokenToReplace, replaceValue = '') {
    files.forEach(sourceFile => {
        const filename = path.basename(sourceFile);
        const destinationFile = path.join(dest, tokenToReplace ? filename.replace(tokenToReplace, replaceValue) : filename);

        if (useAsyncFileOperations) {
            fs.readFile(sourceFile, encodingOptions, (_, contents) => writeFile(destinationFile, contents));
        } else {
            writeFile(destinationFile, getFileContents(sourceFile));
        }
    });
}

// childMessageRenderer_react.jsx -> childMessageRenderer.jsx
// childMessageRenderer_angular.ts -> childMessageRenderer.ts
// childMessageRenderer_vue.js -> childMessageRendererVue.js
function extractComponentFileNames(scripts, token, replaceValue = '') {
    return scripts.map(script => path.basename(script).replace(token, replaceValue));
}

function phpArrayToJSON(string) {
    if (!string) {
        return {};
    }

    const replaced = string
        .replace(/^, /, '') // remove leading comma
        .replace(/'/g, '"') // standardise quotes
        .replace(/\s*=>/g, ':') // transform keys
        .replace(/\[(("\w+"(, )?)+)\]/g, '<<<$1>>>') // mark unkeyed array to avoid it being converted to object
        .replace(/\[/g, '{') // convert keyed arrays to objects
        .replace(/\]/g, '}')
        .replace(/<<</g, '[') // convert unkeyed arrays back
        .replace(/>>>/g, ']');

    try {
        return JSON.parse(replaced);
    } catch (e) {
        console.error(replaced, e);
        throw new Error('The hackish conversion of PHP syntax to JSON failed. Check ./example-generator.js');
    }
}

function getFileContents(path) {
    return fs.readFileSync(path, 'utf8');
}

function forEachExample(done, name, regex, generateExample, scope = '*', trigger) {
    const pattern = trigger && trigger.endsWith('.php') ? trigger : `src/${scope}/*.php`;
    const specificExample = trigger && (matches = /src\/[^\/]+\/([^\/]+)\//.exec(trigger)) && matches[1];

    glob(pattern, {}, (_, files) => {
        const startTime = Date.now();
        const examplesToProcess = [];

        files.forEach(file => {
            const contents = getFileContents(file);
            const section = path.dirname(file).replace('src/', '');

            let matches;

            while ((matches = regex.exec(contents))) {
                const [example, type, options] = matches.slice(1);

                if (type === 'generated' && (!specificExample || example === specificExample)) {
                    examplesToProcess.push({ file, section, example, options });
                }
            }
        });

        const processedExamples = new Set();

        examplesToProcess.forEach(({ file, section, example, options }) => {
            try {
                const examplePath = path.join('./src', section, example);

                if (processedExamples.has(examplePath)) { return; }

                generateExample(examplePath, phpArrayToJSON(options));
                processedExamples.add(examplePath);
            } catch (error) {
                console.error(`Could not process example ${example} in ${file}. Does the example directory exist?`);
                console.error(error);
            }
        });

        const count = processedExamples.size;

        console.log(`\u2714 ${count} ${name} example${count === 1 ? '' : 's'} generated in ${Date.now() - startTime}ms.`);

        if (done) {
            done();
        }
    });
}

function format(source, parser) {
    const formatted = source.replace(/\/\/\s*inScope\[.*\n/, ''); // strip out inScope comments

    return prettier.format(formatted, { parser, singleQuote: true, trailingComma: 'es5' });
}

function createExampleGenerator(prefix, importTypes) {
    const [parser, vanillaToVue, vanillaToReact, vanillaToAngular] = getGeneratorCode(prefix);
    const appModuleAngular = new Map();

    importTypes.forEach(importType => {
        appModuleAngular.set(importType, require(`${prefix}${importType}-angular-app-module.ts`).appModuleAngular);
    });

    return (examplePath, options) => {
        //    src section                        example        glob
        // eg src/javascript-grid-accessing-data/using-for-each/*.js
        const createExamplePath = pattern => path.join(examplePath, pattern);
        const getMatchingPaths = (pattern, options = {}) => glob.sync(createExamplePath(pattern), options);

        const document = getMatchingPaths('index.html')[0];

        if (!document) {
            throw new Error('examples are required to have an index.html file');
        }

        let scripts = getMatchingPaths('*.js');
        let mainScript = scripts[0];

        if (scripts.length > 1) {
            // multiple scripts - main.js is the main one, the rest are supplemental
            mainScript = getMatchingPaths('main.js')[0];

            if (!mainScript) {
                throw new Error('for an example with multiple scripts matching *.js, one must be named main.js');
            }

            // get the rest of the scripts
            scripts = getMatchingPaths('*.js', { ignore: ['**/main.js', '**/*_{angular,react,vanilla,vue}.js'] });
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

        const writeExampleFiles = (importType, framework, frameworkScripts, files, subdirectory, componentPostfix = '') => {
            const basePath = path.join(createExamplePath(`_gen/${importType}`), framework);
            const scriptsPath = subdirectory ? path.join(basePath, subdirectory) : basePath;

            fs.mkdirSync(scriptsPath, { recursive: true });

            Object.keys(files).forEach(name => {
                writeFile(path.join(scriptsPath, name), files[name]);
            });

            if (inlineStyles) {
                writeFile(path.join(basePath, 'styles.css'), inlineStyles);
            }

            copyFiles(stylesheets, basePath);
            copyFiles(scripts, basePath);
            copyFiles(frameworkScripts, scriptsPath, `_${framework}`, componentPostfix);
        };

        // inline styles in the examples index.html
        // will be added to styles.css in the various generated fw examples
        const style = /<style>(.*)<\/style>/s.exec(indexHtml);
        let inlineStyles = style && style.length > 0 && format(style[1], 'css');

        const reactScripts = getMatchingPaths('*_react*');
        const reactConfigs = new Map();

        try {
            const getSource = vanillaToReact(bindings, extractComponentFileNames(reactScripts, '_react'));

            importTypes.forEach(importType => reactConfigs.set(importType, { 'index.jsx': getSource(importType) }));
        } catch (e) {
            console.error(`Failed to process React example in ${examplePath}`, e);
            throw e;
        }

        const angularScripts = getMatchingPaths('*_angular*');
        const angularConfigs = new Map();

        try {
            const angularComponentFileNames = extractComponentFileNames(angularScripts, '_angular');
            const getSource = vanillaToAngular(bindings, angularComponentFileNames);

            importTypes.forEach(importType => {
                angularConfigs.set(importType, {
                    'app.component.ts': getSource(importType),
                    'app.module.ts': appModuleAngular.get(importType)(angularComponentFileNames),
                });
            });
        } catch (e) {
            console.error(`Failed to process Angular example in ${examplePath}`, e);
            throw e;
        }

        const vueScripts = getMatchingPaths('*_vue*');
        const vueConfigs = new Map();

        try {
            const getSource = vanillaToVue(bindings, extractComponentFileNames(vueScripts, '_vue', 'Vue'));

            importTypes.forEach(importType => vueConfigs.set(importType, { 'main.js': getSource(importType) }));
        } catch (e) {
            console.error(`Failed to process Vue example in ${examplePath}`, e);
            throw e;
        }

        emptyDirectory(createExamplePath(`_gen`));

        importTypes.forEach(importType => writeExampleFiles(importType, 'react', reactScripts, reactConfigs.get(importType)));
        importTypes.forEach(importType => writeExampleFiles(importType, 'angular', angularScripts, angularConfigs.get(importType), 'app'));

        // we rename the files so that they end with "Vue.js" - we do this so that we can (later, at runtime) exclude these
        // from index.html will still including other non-component files
        importTypes.forEach(importType => writeExampleFiles(importType, 'vue', vueScripts, vueConfigs.get(importType), undefined, 'Vue'));

        inlineStyles = undefined; // unset these as they don't need to be copied for vanilla

        const vanillaScripts = getMatchingPaths('*.{html,js}', { ignore: ['**/*_{angular,react,vue}.js'] });

        importTypes.forEach(importType => writeExampleFiles(importType, 'vanilla', vanillaScripts, {}));
    };
}

function getGeneratorCode(prefix) {
    const { parser } = require(`${prefix}vanilla-src-parser.ts`);
    const { vanillaToVue } = require(`${prefix}vanilla-to-vue.ts`);
    const { vanillaToReact } = require(`${prefix}vanilla-to-react.ts`);
    const { vanillaToAngular } = require(`${prefix}vanilla-to-angular.ts`);

    return [parser, vanillaToVue, vanillaToReact, vanillaToAngular];
}

function generateExamples(type, importTypes, scope, trigger, done) {
    const exampleGenerator = createExampleGenerator(`./src/example-runner/${type}-`, importTypes);
    const regex = new RegExp(`${type}_example\\('.+?'\\s*,\\s*'(.+?)'\\s*,\\s*'(.+?)'(.*?)\\);?\\s*\\?>`, 'g');

    forEachExample(done, type, regex, exampleGenerator, scope, trigger);
}

module.exports.generateGridExamples = (scope, trigger, done) => {
    try {
        require('ts-node').register();
        generateExamples('grid', ['packages', 'modules'], scope, trigger, done);
    } catch (e) {
        console.error('Failed to generate grid examples', e);
        if (done) {
            done(e);
        }
    }
};

module.exports.generateChartExamples = (scope, trigger, done) => {
    try {
        require('ts-node').register();
        generateExamples('chart', ['packages'], scope, trigger, done);
    } catch (e) {
        console.error('Failed to generate chart examples', e);
        if (done) {
            done(e);
        }
    }
};

module.exports.generateExamples = (scope, trigger) => {
    if (trigger) {
        console.log(`\u270E ${trigger} was changed`);
        console.log(`\u27F3 Re-generating affected examples...`);
    } else if (scope) {
        console.log(`\u27F3 Generating examples for ${scope}...`);
    } else {
        console.log(`\u27F3 Generating all examples...`);
    }

    module.exports.generateGridExamples(scope, trigger);
    module.exports.generateChartExamples(scope, trigger);
};
