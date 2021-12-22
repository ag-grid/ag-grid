const { JSDOM } = require('jsdom');
const { window, document } = new JSDOM('<!DOCTYPE html><html lang="en"></html>');
const sucrase = require("sucrase");

window.Date = Date;
global.window = window;
global.document = document;

const glob = require('glob');
const path = require('path');
const prettier = require('prettier');
const fs = require('fs-extra');

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
        fs.writeFile(destination, formattedContent, encodingOptions, () => {
        });
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

function getFileContents(path) {
    return fs.readFileSync(path, 'utf8');
}

function forEachExample(done, name, regex, generateExample, scope = '*', trigger) {
    const pattern = trigger && trigger.endsWith('.md') ? trigger : `documentation/doc-pages/${scope}/*.md`;
    const specificExample = trigger && (matches = /documentation\/doc-pages\/[^\/]+\/examples\/([^\/]+)\//.exec(trigger)) && matches[1];

    glob(pattern, {}, (_, files) => {
        const startTime = Date.now();
        const examplesToProcess = [];

        files.forEach(file => {
            const contents = getFileContents(file);
            const section = path.dirname(file).replace('documentation/doc-pages/', '');

            let matches;

            while ((matches = regex.exec(contents))) {
                const [example, type, optionsCapture, options] = matches.slice(1);

                if ((type === 'generated' || type === 'mixed' || type === 'typescript') && (!specificExample || example === specificExample)) {
                    examplesToProcess.push({ file, section, example, options, type });
                }
            }
        });

        const processedExamples = new Set();

        let errorInGeneration = false;

        examplesToProcess.forEach(({ file, section, example, options, type }) => {
            try {
                const examplePath = path.join('./documentation/doc-pages', section, 'examples', example);

                if (processedExamples.has(examplePath)) {
                    return;
                }

                generateExample(examplePath, type, options ? JSON.parse(options) : {});
                processedExamples.add(examplePath);
            } catch (error) {
                errorInGeneration = true;
                console.error(`Could not process example ${example} in ${file}. Does the example directory exist?`);
                console.error(error);
            }
        });

        const count = processedExamples.size;

        console.log(`\u2714 ${count} ${name} example${count === 1 ? '' : 's'} generated in ${Date.now() - startTime}ms.`);

        if (done) {
            done(errorInGeneration ? "Error in example generation" : undefined);
        }
    });
}

function format(source, parser) {
    const formatted = source;
    if (process.env.AG_EXAMPLE_DISABLE_FORMATTING === 'true') {
        return formatted;
    }
    return prettier.format(formatted, { parser, singleQuote: true, trailingComma: 'es5' });
    /* try {

        return prettier.format(formatted, { parser, singleQuote: true, trailingComma: 'es5' });
    } catch (error) {
        console.error(error)
        return formatted;
    } */
}

function deepCloneObject(object) {
    return JSON.parse(JSON.stringify(object));
}

function readAsJsFile(tsFile) {
    let jsFile = sucrase.transform(fs.readFileSync(tsFile, 'utf8'), { transforms: ["typescript"] }).code;
    // Remove empty lines left by sucrase removing the imports 
    jsFile = jsFile.replace(/^\s*[\r\n]/, '');
    // Temporary hack to remove import that does not get removed by
    jsFile = jsFile.replace("import * as agCharts from 'ag-charts-community'", '');

    return jsFile;
}

function createExampleGenerator(prefix, importTypes) {
    const [parser, vanillaToVue, vanillaToVue3, vanillaToReact, vanillaToReactFunctional, vanillaToAngular] = getGeneratorCode(prefix);
    const appModuleAngular = new Map();

    importTypes.forEach(importType => {
        appModuleAngular.set(importType, require(`${prefix}${importType}-angular-app-module.ts`).appModuleAngular);
    });

    return (examplePath, type, options) => {
        //          section                 example        glob
        // eg pages/accessing-data/examples/using-for-each/*.js
        const createExamplePath = pattern => path.join(examplePath, pattern);
        const getMatchingPaths = (pattern, options = {}) => glob.sync(createExamplePath(pattern), options);

        const providedExamples = {};

        if (type === 'mixed') {
            // note that there's an expectation that both modules & packages exist
            const providedExamplePaths = glob.sync(`${examplePath}/provided/modules/*`);

            for (const providedExamplePath of providedExamplePaths) {
                providedExamples[path.basename(providedExamplePath)] = `${examplePath}/provided`;
            }
        }

        const document = getMatchingPaths('index.html')[0];

        if (!document) {
            throw new Error('examples are required to have an index.html file');
        }


        let rawScripts = getMatchingPaths('*.{js,ts}');
        let mainScript = rawScripts[0];

        if (rawScripts.length > 1) {
            // multiple scripts - main.{js, ts} is the main one, the rest are supplemental
            const mainJsScripts = getMatchingPaths('main.js');
            const mainTsScripts = getMatchingPaths('main.ts');
            mainScript = mainJsScripts.length > 0 ? mainJsScripts[0] : mainTsScripts[0];

            if (!mainScript) {
                throw new Error('for an example with multiple scripts matching *.js, one must be named main.[js,ts]');
            }

            // get the rest of the scripts
            rawScripts = getMatchingPaths('*.{js,ts}', { ignore: ['**/main.{js,ts}', '**/*_{angular,react,vanilla,vue}.{js,ts}'] });
        } else {
            // only one script, which is the main one
            rawScripts = [];
        }

        // any associated css
        const stylesheets = getMatchingPaths('*.css');

        // read the main script (ts / js) and the associated index.html
        let jsFile = mainScript.endsWith('.ts') ? readAsJsFile(mainScript) : getFileContents(mainScript);
        const indexHtml = getFileContents(document);

        // ********************* TEST CODE DONT COMMIT TO LATEST **********************************????????????????????????/
        /*         if (process.env.LOGNAME === 'stephencooper') {
                    const dumpPath = "/Users/stephencooper/Workspace/test-output-ag-grid/snapshots/";
                    fs.writeFileSync(dumpPath + "/" + mainScript.replace(/\//g, '_').replace('.js', '.json').replace('.ts', '.json'), "")
                } */
        // ********************* TEST CODE DONT COMMIT TO LATESTS **********************************????????????????????????/

        const bindings = parser(jsFile, indexHtml, options, type, providedExamples);

        // ********************* TEST CODE DONT COMMIT TO LATEST **********************************????????????????????????/        
        /*         if (process.env.LOGNAME === 'stephencooper') {
                    const dumpPath = "/Users/stephencooper/Workspace/test-output-ag-grid/snapshots/";
                    fs.writeFileSync(dumpPath + "/" + mainScript.replace(/\//g, '_').replace('.js', '.json').replace('.ts', '.json'), JSON.stringify(bindings))
                } */
        // ********************* TEST CODE DONT COMMIT TO LATESTS **********************************????????????????????????/


        const writeExampleFiles = (importType, framework, tokenToReplace, frameworkScripts, files, subdirectory, componentPostfix = '') => {
            const basePath = path.join(createExamplePath(`_gen/${importType}`), framework);
            const scriptsPath = subdirectory ? path.join(basePath, subdirectory) : basePath;

            fs.mkdirSync(scriptsPath, { recursive: true });

            Object.keys(files).forEach(name => writeFile(path.join(scriptsPath, name), files[name]));

            if (inlineStyles) {
                writeFile(path.join(basePath, 'styles.css'), inlineStyles);
            }

            copyFiles(stylesheets, basePath);
            copyFiles(rawScripts, basePath);
            copyFiles(frameworkScripts, scriptsPath, `_${tokenToReplace}`, componentPostfix);
        };

        const copyProvidedExample = (importType, framework, providedRootPath) => {
            const destPath = path.join(createExamplePath(`_gen/${importType}`), framework);
            const sourcePath = path.join(providedRootPath, importType, framework);

            fs.copySync(sourcePath, destPath);
        };

        fs.emptyDirSync(createExamplePath(`_gen`));

        // inline styles in the examples index.html
        // will be added to styles.css in the various generated fw examples
        const style = /<style>(.*)<\/style>/s.exec(indexHtml);
        let inlineStyles = style && style.length > 0 && format(style[1], 'css');

        if (type !== 'typescript') {
            // When the type == typescript we only want to generate the vanilla option and so skip all other frameworks

            if (type === 'mixed' && providedExamples['react']) {
                importTypes.forEach(importType => copyProvidedExample(importType, 'react', providedExamples['react']));
            } else {
                const reactScripts = getMatchingPaths('*_react.*');
                const reactConfigs = new Map();

                try {
                    const getSource = vanillaToReact(deepCloneObject(bindings), extractComponentFileNames(reactScripts, '_react'));
                    importTypes.forEach(importType => reactConfigs.set(importType, { 'index.jsx': getSource(importType) }));
                } catch (e) {
                    console.error(`Failed to process React example in ${examplePath}`, e);
                    throw e;
                }

                importTypes.forEach(importType => writeExampleFiles(importType, 'react', 'react', reactScripts, reactConfigs.get(importType)));
            }

            if (type === 'mixed' && providedExamples['reactFunctional']) {
                importTypes.forEach(importType => copyProvidedExample(importType, 'reactFunctional', providedExamples['reactFunctional']));
            } else {
                let reactDeclarativeScripts = null;
                const reactDeclarativeConfigs = new Map();

                if (vanillaToReactFunctional && options.reactFunctional !== false) {
                    const hasFunctionalScripts = getMatchingPaths('*_reactFunctional.*').length > 0;
                    const reactScriptPostfix = hasFunctionalScripts ? 'reactFunctional' : 'react';

                    reactDeclarativeScripts = getMatchingPaths(`*_${reactScriptPostfix}.*`);

                    try {
                        const getSource = vanillaToReactFunctional(deepCloneObject(bindings), extractComponentFileNames(reactDeclarativeScripts, `_${reactScriptPostfix}`));
                        importTypes.forEach(importType => reactDeclarativeConfigs.set(importType, { 'index.jsx': getSource(importType) }));
                    } catch (e) {
                        console.error(`Failed to process React example in ${examplePath}`, e);
                        throw e;
                    }

                    importTypes.forEach(importType => writeExampleFiles(importType, 'reactFunctional', reactScriptPostfix, reactDeclarativeScripts, reactDeclarativeConfigs.get(importType)));
                }
            }

            if (type === 'mixed' && providedExamples['angular']) {
                importTypes.forEach(importType => copyProvidedExample(importType, 'angular', providedExamples['angular']));
            } else {
                const angularScripts = getMatchingPaths('*_angular*');
                const angularConfigs = new Map();
                try {
                    const angularComponentFileNames = extractComponentFileNames(angularScripts, '_angular');
                    const getSource = vanillaToAngular(deepCloneObject(bindings), angularComponentFileNames);

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

                importTypes.forEach(importType => writeExampleFiles(importType, 'angular', 'angular', angularScripts, angularConfigs.get(importType), 'app'));
            }

            if (type === 'mixed' && providedExamples['vue']) {
                importTypes.forEach(importType => copyProvidedExample(importType, 'vue', providedExamples['vue']));
            } else {
                const vueScripts = getMatchingPaths('*_vue*');
                const vueConfigs = new Map();
                try {
                    const getSource = vanillaToVue(deepCloneObject(bindings), extractComponentFileNames(vueScripts, '_vue', 'Vue'));

                    importTypes.forEach(importType => vueConfigs.set(importType, { 'main.js': getSource(importType) }));
                } catch (e) {
                    console.error(`Failed to process Vue example in ${examplePath}`, e);
                    throw e;
                }

                // we rename the files so that they end with "Vue.js" - we do this so that we can (later, at runtime) exclude these
                // from index.html will still including other non-component files
                importTypes.forEach(importType => writeExampleFiles(importType, 'vue', 'vue', vueScripts, vueConfigs.get(importType), undefined, 'Vue'));
            }

            if (type === 'mixed' && providedExamples['vue3']) {
                importTypes.forEach(importType => copyProvidedExample(importType, 'vue3', providedExamples['vue3']));
            } else {
                if (vanillaToVue3) {
                    const vueScripts = getMatchingPaths('*_vue*');
                    const vueConfigs = new Map();
                    try {
                        const getSource = vanillaToVue3(bindings, extractComponentFileNames(vueScripts, '_vue', 'Vue'));

                        importTypes.forEach(importType => vueConfigs.set(importType, { 'main.js': getSource(importType) }));
                    } catch (e) {
                        console.error(`Failed to process Vue 3 example in ${examplePath}`, e);
                        throw e;
                    }

                    // we rename the files so that they end with "Vue.js" - we do this so that we can (later, at runtime) exclude these
                    // from index.html will still including other non-component files
                    importTypes.forEach(importType => writeExampleFiles(importType, 'vue3', 'vue', vueScripts, vueConfigs.get(importType), undefined, 'Vue'));
                }
            }
        }

        if (type === 'mixed' && providedExamples['vanilla']) {
            importTypes.forEach(importType => copyProvidedExample(importType, 'vanilla', providedExamples['vanilla']));
        } else {

            inlineStyles = undefined; // unset these as they don't need to be copied for vanilla

            try {
                let jsFiles = {}
                const tsScripts = getMatchingPaths('*.ts', { ignore: ['**/*_{angular,react,vue,vue3}.ts'] });
                tsScripts.forEach(tsFile => {
                    jsFile = readAsJsFile(tsFile);
                    const jsFileName = path.parse(tsFile).base.replace('.ts', '.js');
                    jsFiles[jsFileName] = jsFile;
                });

                const updatedScripts = getMatchingPaths('*.{html,js}', { ignore: ['**/*_{angular,react,vue,vue3}.js'] });
                importTypes.forEach(importType => writeExampleFiles(importType, 'vanilla', 'vanilla', updatedScripts, jsFiles));

            } catch (e) {
                console.error(`Failed to process Vanilla example in ${examplePath}`, e);
                throw e;
            }
        }

        // Uncomment when ready to setup Typescript examples
        // inlineStyles = undefined; // unset these as they don't need to be copied for typescript
        // const typescriptScripts = getMatchingPaths('*.{html,ts}', { ignore: ['**/* _{ angular, react, vue, vue3 }.js'] });
        // importTypes.forEach(importType => writeExampleFiles(importType, 'typescript', 'typescript', typescriptScripts, {}));
    };
}

function getGeneratorCode(prefix) {
    const gridExamples = prefix === './src/example-generation/grid-' || false;
    const generateReactFire = process.env.AG_GENERATE_REACT_FIRE || false;

    if (generateReactFire) {
        console.warn("********************************************");
        console.warn("************ React Fire Enabled ************");
        console.warn("********************************************");
    }

    const { parser } = require(`${prefix}vanilla-src-parser.ts`);
    const { vanillaToVue } = require(`${prefix}vanilla-to-vue.ts`);
    const { vanillaToReact } = require(`${prefix}vanilla-to-react${gridExamples && generateReactFire ? '-fire' : ''}.ts`);
    const { vanillaToVue3 } = require(`${prefix}vanilla-to-vue3.ts`);

    // spl todo - add charts & vue 3 support in time
    let vanillaToReactFunctional = null;
    if (gridExamples) {
        vanillaToReactFunctional = require(`${prefix}vanilla-to-react${generateReactFire ? '-fire' : ''}-functional.ts`).vanillaToReactFunctional;
    }

    const { vanillaToAngular } = require(`${prefix}vanilla-to-angular.ts`);

    return [parser, vanillaToVue, vanillaToVue3, vanillaToReact, vanillaToReactFunctional, vanillaToAngular];
}

function generateExamples(type, importTypes, scope, trigger, done) {
    const exampleGenerator = createExampleGenerator(`./src/example-generation/${type}-`, importTypes);
    const regex = new RegExp(`<${type}-example.*?name=['"](.*?)['"].*?type=['"](.*?)['"](.*?options='(.*?)')?`, 'g');

    forEachExample(done, type, regex, exampleGenerator, scope, trigger);
}

module.exports.generateGridExamples = (scope, trigger, done, tsRegistered = false) => {
    try {
        if (!tsRegistered) {
            require('ts-node').register();
        }
        generateExamples('grid', ['packages', 'modules'], scope, trigger, done);
    } catch (e) {
        console.error('Failed to generate grid examples', e);

        if (done) {
            done(e);
        }
    }
};

module.exports.generateChartExamples = (scope, trigger, done, tsRegistered = false) => {
    try {
        if (!tsRegistered) {
            require('ts-node').register();
        }
        generateExamples('chart', ['packages'], scope, trigger, done);
    } catch (e) {
        console.error('Failed to generate chart examples', e);

        if (done) {
            done(e);
        }
    }
};

module.exports.generateDocumentationExamples = async (scope, trigger) => {
    require('ts-node').register();
    if (trigger) {
        console.log(`\u270E ${trigger} was changed`);
        console.log(`\u27F3 Re-generating affected documentation examples...`);
    } else if (scope) {
        console.log(`\u27F3 Generating documentation examples for ${scope}...`);
    } else {
        console.log(`\u27F3 Generating all documentation examples...`);
    }

    return new Promise(resolve => {
        module.exports.generateGridExamples(
            scope, trigger, () => module.exports.generateChartExamples(scope, trigger, () => resolve(), true), true
        );
    });
};