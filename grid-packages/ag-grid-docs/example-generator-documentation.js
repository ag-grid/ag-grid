const {JSDOM} = require('jsdom');
const {window, document} = new JSDOM('<!DOCTYPE html><html lang="en"></html>');
const sucrase = require("sucrase");

const agGridVersion = "^" + require('../../grid-community-modules/core/package.json').version;
const agGridEnterpriseVersion = "^" + require('../../grid-enterprise-modules/core/package.json').version;
const agGridReactVersion = "^" + require('../../grid-community-modules/react/package.json').version;
const agGridAngularVersion = "^" + require('../../grid-community-modules/angular/package.json').version;
const getGenericInterface = require('./documentation/shared-types/generators')

// whether integrated charts includes ag-charts-enterprise or just ag-charts-community
// also need to update grid-packages/ag-grid-docs/documentation/src/utils/consts.js if this value is changed
// and grid-packages/ag-grid-docs/example-generator-documentation.js
const integratedChartsUsesChartsEnterprise = true;

window.Date = Date;
global.window = window;
global.document = document;

const glob = require('glob');
const path = require('path');
const prettier = require('prettier');
const fs = require('fs-extra');

const extensionsToOverride = new Set(['html', 'js', 'jsx', 'tsx', 'ts']);
const parsers = {
    js: 'babel',
    jsx: 'babel',
    tsx: 'babel-ts',
    ts: 'typescript',
};

const encodingOptions = {encoding: 'utf8'};

function writeFile(destination, contents) {
    // allow developers to override the example theme with an environment variable
    const themeOverride = process.env.AG_EXAMPLE_THEME_OVERRIDE;

    if (themeOverride && extensionsToOverride.has(path.extname(destination).slice(1))) {
        contents = contents.replace(/ag-theme-quartz/g, `ag-theme-${themeOverride}`);
    }

    const filename = path.basename(destination);
    const extension = path.extname(destination).slice(1);
    const parser = parsers[extension] || extension;
    const formattedContent = format(filename, contents, parser, destination);

    if (fs.existsSync(destination) && fs.readFileSync(destination).toString('utf-8') === formattedContent) {
        // Nothing to write (don't trigger a cascade of build processes).
        return;
    }

    fs.writeFileSync(destination, formattedContent, encodingOptions);
}

function copyFiles(files, dest, tokenToReplace, replaceValue = '', importType, forceConversion = false) {
    files.forEach(sourceFile => {
        const filename = path.basename(sourceFile);
        const destinationFile = path.join(dest, tokenToReplace ? filename.replace(tokenToReplace, replaceValue) : filename);

        const updateImports = (src) => {

            if (!forceConversion &&
                (!destinationFile.endsWith('.ts') &&
                    !destinationFile.endsWith('.tsx') &&
                    !destinationFile.endsWith('.jsx'))) {
                return src;
            }

            const {
                parseFile,
                extractImportStatements,
                addBindingImports
            } = require(`./src/example-generation/parser-utils.ts`);
            src = tokenToReplace ? src.replace(tokenToReplace, '') : src;
            const parsed = parseFile(src)
            const imports = extractImportStatements(parsed);

            let formattedImports = '';
            if (imports.length > 0) {
                let importStrings = [];
                const convertToPackage = importType === 'packages';
                addBindingImports(imports, importStrings, convertToPackage, true);
                formattedImports = `${importStrings.join('\n')}\n`

                // Remove the original import statements
                src = src.replace(/import.*from.*\n/g, '').replace(/import.*['"].*['"].*\n/g, '');
                if (convertToPackage) {
                    src = src
                        .replace(/\/\/ Register the required feature modules with the Grid\n/, '')
                        .replace(/ModuleRegistry.registerModules.*?\n/, '');


                    const ensureRegistryUsed = ['[modules]=', ':modules=', 'modules={', 'modules:'];
                    if (ensureRegistryUsed.some(toCheck => src.includes(toCheck)) && !sourceFile.includes('/provided/')) {
                        throw new Error(sourceFile + ' Provided examples must be written using Feature Modules that are registered via the ModuleRegistry! You have provided modules directly to the grid which is not supported! Update the example to use the ModuleRegistry.registerModules().')
                    }
                }
                // Need to ensure that useStrict and noChecks remain at the top of the file.
                let addStrict = false;
                let addNoCheck = false;
                if (src.includes(`'use strict';`)) {
                    src = src.replace(`'use strict';\n`, '');
                    addStrict = true;
                }
                if (src.includes(`//@ts-nocheck`)) {
                    src = src.replace(`//@ts-nocheck\n`, '');
                    addNoCheck = true;
                }
                src = (addNoCheck ? `//@ts-nocheck\n` : '') + (addStrict ? `'use strict';\n` : '') + formattedImports + src
            }

            return src;
        }

        writeFile(destinationFile, updateImports((getFileContents(sourceFile))));
    });
}

// childMessageRenderer_typescript.ts -> childMessageRenderer.ts
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
                    examplesToProcess.push({file, section, example, options, type});
                }
            }
        });

        const processedExamples = new Set();

        let errorInGeneration = false;

        examplesToProcess.forEach(({file, section, example, options, type}) => {
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

function format(filename, source, parser, destination) {
    const formatted = source;
    if (process.env.AG_EXAMPLE_DISABLE_FORMATTING === 'true') {
        return formatted;
    }
    try {
        return prettier.format(formatted, {
            // Filename is necessary to trigger jsx mode (prevents removing unused `React` imports)
            filepath: filename,
            parser,
            singleQuote: true,
            trailingComma: 'es5',
            pluginSearchDirs: ["./"],
            plugins: ["prettier-plugin-organize-imports"],
        })
    } catch (error) {
        console.log(destination, error)
        return formatted;
    }
}

function deepCloneObject(object) {
    return JSON.parse(JSON.stringify(object));
}

function readAsJsFile(tsFilePath) {
    const tsFile = fs.readFileSync(tsFilePath, 'utf8')
        // Remove imports that are not required in javascript
        .replace(/import ((.|\n)*?)from.*\n/g, '')
        // Remove export statement
        .replace(/export /g, "")

    let jsFile = sucrase.transform(tsFile, {transforms: ["typescript"], disableESTransforms: true}).code;

    return jsFile;
}

const skipFramework = framework => {
    if (!process.env.AG_FW_EXAMPLES_TO_GENERATE) {
        return false;
    }

    return !(process.env.AG_FW_EXAMPLES_TO_GENERATE === framework);
}

const skipPackages = () => {
    return !!process.env.AG_SKIP_PACKAGE_EXAMPLES;
}

function createExampleGenerator(exampleType, prefix, importTypes, incremental) {
    const [parser, vanillaToVue, vanillaToVue3, vanillaToReactFunctional, vanillaToReactFunctionalTs, vanillaToAngular, vanillaToTypescript, getIntegratedDarkModeCode] = getGeneratorCode(prefix);

    return (examplePath, type, options) => {
        //          section                 example        glob
        // eg pages/accessing-data/examples/using-for-each/*.js
        const createExamplePath = pattern => path.join(examplePath, pattern);
        const getMatchingPaths = (pattern, options = {}) => glob.sync(createExamplePath(pattern), options);

        function addRawScripts(fileMap, convertToJs, fileExtension = '.ts') {
            const tsScripts = getMatchingPaths('*.ts', {ignore: ['**/*_{angular,react,vue,vue3,typescript}.ts', '**/main.ts', '**/interfaces.ts']});
            tsScripts.forEach(tsFile => {

                let fileContents, fileName;
                if (convertToJs) {
                    fileContents = readAsJsFile(tsFile);
                    fileName = path.parse(tsFile).base.replace('.ts', '.js');
                } else {
                    fileContents = getFileContents(tsFile);
                    fileName = path.parse(tsFile).base.replace('.ts', fileExtension);
                }

                importTypes.forEach(importType => fileMap.set(importType, {
                    ...fileMap.get(importType),
                    [fileName]: fileContents
                }));
            });

            return fileMap;
        }

        function getInterfaceFileContents(tsBindings) {
            let interfaces = [];
            const interfaceFile = getMatchingPaths('*interfaces.ts');
            // If the example has an existing interface file then merge that with our globally shared interfaces
            if (interfaceFile.length === 1) {
                const exampleInterfaces = getFileContents(interfaceFile[0]);
                interfaces.push(exampleInterfaces);
            }
            if (tsBindings.tData && !interfaces.some(i => i.includes(tsBindings.tData))) {
                interfaces.push(getGenericInterface(tsBindings.tData));
            }
            if (interfaces.length > 0) {
                return interfaces.join('\n');
            }
            return undefined;
        }

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

        const mainTsScripts = getMatchingPaths('main.ts');
        const mainScript = mainTsScripts[0];
        if (!mainScript) {
            throw new Error('for an example with multiple scripts matching *.ts, one must be named main.ts');
        }

        // get the rest of the scripts
        const rawScripts = getMatchingPaths('*.js', {ignore: ['**/main.ts', '**/*_{angular,react,vanilla,vue,typescript}.{js,ts}']});

        // any associated css
        const stylesheets = getMatchingPaths('*.css');

        // read the main script and the associated index.html
        let mainFile = getFileContents(mainScript);
        const indexHtml = getFileContents(document);

        // inline styles in the examples index.html
        // will be added to styles.css in the various generated fw examples
        const style = /<style>(.*)<\/style>/s.exec(indexHtml);
        let inlineStyles = style && style.length > 0 && format('styles.css', style[1], 'css');

        // for anything but vanilla JS we need all stylesheets (including any created styles.css from inline styles)
        const allStylesheets = stylesheets.concat(inlineStyles ? ['styles.css'] : []);

        const {
            bindings,
            typedBindings
        } = parser(examplePath, mainScript, mainFile, indexHtml, options, type, providedExamples);

        const writeExampleFiles = (importType, framework, tokenToReplace, frameworkScripts, files, subdirectory, componentPostfix = '') => {
            const basePath = path.join(createExamplePath(`_gen/${importType}`), framework);
            const scriptsPath = subdirectory ? path.join(basePath, subdirectory) : basePath;

            if (!fs.existsSync(scriptsPath)) {
                fs.mkdirSync(scriptsPath, {recursive: true});
            }

            Object.keys(files).forEach(name => writeFile(path.join(scriptsPath, name), files[name]));

            if (inlineStyles) {
                writeFile(path.join(basePath, 'styles.css'), inlineStyles);
            }

            // Add if it is needed for the give framework, i.e Angular / Typescript
            // as used to power type checking in plunker.
            addPackageJson(exampleType, framework, importType, basePath);

            copyFiles(stylesheets, basePath);
            copyFiles(rawScripts, basePath);
            copyFiles(frameworkScripts, scriptsPath, `_${tokenToReplace}`, componentPostfix, importType);
        };

        const copyProvidedExample = (importType, framework, providedRootPath) => {

            const destPath = path.join(createExamplePath(`_gen/${importType}`), framework);
            const sourcePath = path.join(providedRootPath, 'modules', framework);

            // May want to formalise this feature in the future for other examples...
            const suppressProvidePackageConversion = sourcePath.includes('modules/examples/individual-registration');

            if (importType === 'packages' && !suppressProvidePackageConversion) {
                // Convert the modules provided example into a packages version
                fs.mkdirSync(destPath, {recursive: true});

                let fileOrFolders = fs.readdirSync(sourcePath);
                let files = fileOrFolders.filter(f => f.includes('.'));
                let folders = fileOrFolders.filter(f => !f.includes('.'));

                if (files.length > 0) {
                    copyFiles(files.map(f => sourcePath + '/' + f), destPath, `_IGNORE`, '', 'packages', true);
                }
                if (folders) {
                    folders.forEach(f => {
                        const folderPath = sourcePath + '/' + f;
                        const subDest = destPath + '/' + f;
                        fs.mkdirSync(subDest, {recursive: true});
                        let subFiles = fs.readdirSync(folderPath);
                        copyFiles(subFiles.map(s => folderPath + '/' + s), subDest, `_IGNORE`, '', 'packages', true);
                    })
                }
            } else {
                fs.copySync(sourcePath, destPath);
            }
            addPackageJson(exampleType, framework, importType, destPath);
            addAngularMainFile(framework, destPath);
        };

        const genDir = createExamplePath(`_gen`);
        if (!incremental) {
            fs.emptyDirSync(genDir);
        } else {
            fs.mkdirSync(genDir, {recursive: true});
        }

        if (type !== 'typescript') {
            // When the type == typescript we only want to generate the vanilla option and so skip all other frameworks

            if (!skipFramework('react')) {
                if (type === 'mixed' && providedExamples['reactFunctional']) {
                    importTypes.forEach(importType => copyProvidedExample(importType, 'reactFunctional', providedExamples['reactFunctional']));
                } else {
                    let reactDeclarativeScripts = null;
                    let reactDeclarativeConfigs = new Map();

                    if (vanillaToReactFunctional && options.reactFunctional !== false) {
                        const reactScriptPostfix = 'reactFunctional';

                        reactDeclarativeScripts = getMatchingPaths(`*_${reactScriptPostfix}.*`, {ignore: ['**/*.tsx']});

                        try {
                            const getSource = vanillaToReactFunctional(deepCloneObject(bindings), extractComponentFileNames(reactDeclarativeScripts, `_${reactScriptPostfix}`), allStylesheets);
                            importTypes.forEach(importType => reactDeclarativeConfigs.set(importType, {'index.jsx': getSource(importType)}));
                            reactDeclarativeConfigs = addRawScripts(reactDeclarativeConfigs, true)
                        } catch (e) {
                            console.error(`Failed to process React example in ${examplePath}`, e);
                            throw e;
                        }

                        importTypes.forEach(importType => writeExampleFiles(importType, 'reactFunctional', reactScriptPostfix, reactDeclarativeScripts, reactDeclarativeConfigs.get(importType)));
                    }
                }

                if (type === 'mixed' && providedExamples['reactFunctionalTs']) {
                    importTypes.forEach(importType => copyProvidedExample(importType, 'reactFunctionalTs', providedExamples['reactFunctionalTs']));
                } else {
                    let reactDeclarativeScripts = null;
                    let reactDeclarativeConfigs = new Map();

                    if (vanillaToReactFunctionalTs && options.reactFunctional !== false) {
                        const reactScriptPostfix = 'reactFunctional';

                        reactDeclarativeScripts = getMatchingPaths(`*_${reactScriptPostfix}.tsx`);

                        try {
                            const getSource = vanillaToReactFunctionalTs(deepCloneObject(typedBindings), extractComponentFileNames(reactDeclarativeScripts, `_${reactScriptPostfix}.tsx`, ''), allStylesheets);
                            importTypes.forEach(importType => reactDeclarativeConfigs.set(importType, {'index.tsx': getSource(importType)}));
                            reactDeclarativeConfigs = addRawScripts(reactDeclarativeConfigs, false, '.tsx');

                            const interfaces = getInterfaceFileContents(typedBindings);
                            if (interfaces) {
                                importTypes.forEach(importType =>
                                    reactDeclarativeConfigs.set(importType,
                                        {
                                            ...reactDeclarativeConfigs.get(importType),
                                            'interfaces.ts': interfaces
                                        }));
                            }

                        } catch (e) {
                            console.error(`Failed to process React Typescript example in ${examplePath}`, e);
                            throw e;
                        }

                        importTypes.forEach(importType => writeExampleFiles(importType, 'reactFunctionalTs', reactScriptPostfix + '.tsx', reactDeclarativeScripts, reactDeclarativeConfigs.get(importType), undefined, '.tsx'));
                    }
                }
            }


            if (!skipFramework('angular')) {
                if (type === 'mixed' && providedExamples['angular']) {
                    importTypes.forEach(importType => copyProvidedExample(importType, 'angular', providedExamples['angular']));
                } else {
                    const angularScripts = getMatchingPaths('*_angular*');
                    let angularConfigs = new Map();
                    try {
                        const angularComponentFileNames = extractComponentFileNames(angularScripts, '_angular');
                        const getSource = vanillaToAngular(deepCloneObject(typedBindings), angularComponentFileNames, allStylesheets);

                        importTypes.forEach(importType => {
                            let frameworkFiles = {
                                'app.component.ts': getSource(importType),
                                'main.ts' : ANGULAR_MAIN_FILE
                            };
                            const interfaces = getInterfaceFileContents(typedBindings);
                            if (interfaces) {
                                frameworkFiles = {...frameworkFiles, 'interfaces.ts': interfaces}
                            }
                            angularConfigs.set(importType, frameworkFiles);
                        });
                        angularConfigs = addRawScripts(angularConfigs, false);
                    } catch (e) {
                        console.error(`Failed to process Angular example in ${examplePath}`, e);
                        throw e;
                    }

                    importTypes.forEach(importType => writeExampleFiles(importType, 'angular', 'angular', angularScripts, angularConfigs.get(importType)));
                }
            }

            if (!skipFramework('vue')) {
                if (type === 'mixed' && providedExamples['vue']) {
                    importTypes.forEach(importType => copyProvidedExample(importType, 'vue', providedExamples['vue']));
                } else {
                    const vueScripts = getMatchingPaths('*_vue*');
                    let vueConfigs = new Map();
                    try {
                        const getSource = vanillaToVue(deepCloneObject(bindings), extractComponentFileNames(vueScripts, '_vue', 'Vue'), allStylesheets);

                        importTypes.forEach(importType => vueConfigs.set(importType, {'main.js': getSource(importType)}));
                        vueConfigs = addRawScripts(vueConfigs, true);
                    } catch (e) {
                        console.error(`Failed to process Vue example in ${examplePath}`, e);
                        throw e;
                    }

                    // we rename the files so that they end with "Vue.js" - we do this so that we can (later, at runtime) exclude these
                    // from index.html will still including other non-component files
                    importTypes.forEach(importType => writeExampleFiles(importType, 'vue', 'vue', vueScripts, vueConfigs.get(importType), undefined, 'Vue'));
                }
            }

            if (!skipFramework('vue3')) {
                if (type === 'mixed' && providedExamples['vue3']) {
                    importTypes.forEach(importType => copyProvidedExample(importType, 'vue3', providedExamples['vue3']));
                } else {
                    if (vanillaToVue3) {
                        const vueScripts = getMatchingPaths('*_vue*');
                        let vueConfigs = new Map();
                        try {
                            const getSource = vanillaToVue3(bindings, extractComponentFileNames(vueScripts, '_vue', 'Vue'), allStylesheets);

                            importTypes.forEach(importType => vueConfigs.set(importType, {'main.js': getSource(importType)}));
                            vueConfigs = addRawScripts(vueConfigs, true);
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
        }

        if (!skipFramework('vanilla')) {
            if (type === 'mixed' && providedExamples['vanilla']) {
                importTypes.forEach(importType => copyProvidedExample(importType, 'vanilla', providedExamples['vanilla']));
            } else {

                inlineStyles = undefined; // unset these as they don't need to be copied for vanilla

                try {
                    let jsFiles = {}
                    const tsScripts = getMatchingPaths('*.ts', {ignore: ['**/*_{angular,react,vue,vue3}.ts']});
                    tsScripts.forEach(tsFile => {


                        let jsFile = readAsJsFile(tsFile);
                        // replace Typescript createGrid( with Javascript agGrid.createGrid(
                        jsFile = jsFile.replace(/createGrid\(/g, 'agGrid.createGrid(');

                        // replace Typescript LicenseManager.setLicenseKey( with Javascript agGrid.LicenseManager.setLicenseKey(
                        jsFile = jsFile.replace(/LicenseManager\.setLicenseKey\(/g, "agGrid.LicenseManager.setLicenseKey(");

                        jsFile = jsFile.replace(/agGrid\.createGrid(.*);/g, `agGrid.createGrid$1; ${getIntegratedDarkModeCode(tsFile, false, 'gridApi')}`);

                        const jsFileName = path.parse(tsFile).base.replace('.ts', '.js').replace('_typescript.js', '.js');
                        jsFiles[jsFileName] = jsFile;
                    });

                    const updatedScripts = getMatchingPaths('*.{html,js}', {ignore: ['**/*_{angular,react,vue,vue3}.js']});
                    importTypes.forEach(importType => writeExampleFiles(importType, 'vanilla', 'vanilla', updatedScripts, jsFiles));

                } catch (e) {
                    console.error(`Failed to process Vanilla example in ${examplePath}`, e);
                    throw e;
                }
            }

            if (type === 'mixed' && providedExamples['typescript']) {
                importTypes.forEach(importType => copyProvidedExample(importType, 'typescript', providedExamples['typescript']));
            } else {

                const htmlScripts = getMatchingPaths('*.html');
                const tsScripts = getMatchingPaths('*.ts', {ignore: ['**/*_{angular,react,vue,vue3}.ts', '**/main.ts', '**/interfaces.ts']});
                const tsConfigs = new Map();
                try {
                    const getSource = vanillaToTypescript(deepCloneObject(typedBindings), mainScript, allStylesheets);
                    importTypes.forEach(importType => {
                        tsConfigs.set(importType, {
                            'main.ts': getSource(importType),
                        });

                        const interfaces = getInterfaceFileContents(typedBindings);
                        if (interfaces) {
                            tsConfigs.set(importType, {
                                ...tsConfigs.get(importType),
                                'interfaces.ts': interfaces
                            });
                        }

                    });
                } catch (e) {
                    console.error(`Failed to process Typescript example in ${examplePath}`, e);
                    throw e;
                }

                importTypes.forEach(importType => writeExampleFiles(importType, 'typescript', 'typescript', [...htmlScripts, ...tsScripts], tsConfigs.get(importType)));
            }
        }
    };
}

const moduleMapping = require('./documentation/doc-pages/modules/modules.json');
const modules = moduleMapping
    .filter(moduleConfig => !moduleConfig.framework)
    .map(moduleConfig => moduleConfig.module);

function addAngularMainFile(framework, basePath) {
    if (framework === 'angular') {
       writeFile(path.join(basePath, 'main.ts'), ANGULAR_MAIN_FILE);
    }
}

/** Used for type checking in plunker, and type checking & dep installation with codesandbox */
function addPackageJson(type, framework, importType, basePath) {

    const supportedFrameworks = new Set(['angular', 'typescript', 'reactFunctional', 'reactFunctionalTs', 'vanilla'])
    if (!supportedFrameworks.has(framework)) {
        return;
    }

    const packageJson = {
        name: `ag-${type}-${importType}`,
        dependencies: {},
    };

    const addDependency = (name, version) => {
        packageJson.dependencies[name] = version;
    };

    if (framework === 'angular') {
        addDependency('@angular/core', "^14");
        addDependency('@angular/common', "^14");
        addDependency('@angular/forms', "^14");
        addDependency('@angular/platform-browser', "^14");
    }

    function isFrameworkReact() {
        return new Set(['reactFunctional', 'reactFunctionalTs']).has(framework);
    }

    if (isFrameworkReact()) {
        addDependency('react', '18');
        addDependency('react-dom', '18');

        addDependency('@types/react', '18');
        addDependency('@types/react-dom', '18');
    }

    if (importType === 'modules' && framework !== 'vanilla') {
        if (type === 'grid' && framework === 'angular') {
            addDependency('@ag-grid-community/angular', agGridAngularVersion);
        }
        if (type === 'grid' && isFrameworkReact()) {
            addDependency('@ag-grid-community/react', agGridReactVersion);
        }
        modules.forEach(m => addDependency(m, agGridVersion));
    } else {
        if (type === 'grid') {
            if (framework === 'angular') {
                addDependency('ag-grid-angular', agGridAngularVersion);
            }
            if (isFrameworkReact()) {
                addDependency('ag-grid-react', agGridReactVersion);
            }
            addDependency('ag-grid-community', agGridVersion);
            addDependency(`ag-grid-${integratedChartsUsesChartsEnterprise ? 'charts-' : ''}enterprise`, agGridEnterpriseVersion);
        }
    }

    writeFile(path.join(basePath, 'package.json'), JSON.stringify(packageJson, null, 4));
}

const ANGULAR_MAIN_FILE =
`import '@angular/compiler';
import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app.component';

if((window as any).ENABLE_PROD_MODE){
  enableProdMode();
}

bootstrapApplication(AppComponent);
`

function getGeneratorCode(prefix) {
    const {parser} = require(`${prefix}vanilla-src-parser.ts`);
    const {vanillaToVue} = require(`${prefix}vanilla-to-vue.ts`);
    const {vanillaToTypescript} = require(`${prefix}vanilla-to-typescript.ts`);
    const {vanillaToVue3} = require(`${prefix}vanilla-to-vue3.ts`);
    const {vanillaToReactFunctional} = require(`${prefix}vanilla-to-react-functional.ts`);
    const {vanillaToReactFunctionalTs} = require(`${prefix}vanilla-to-react-functional-ts.ts`);
    const {vanillaToAngular} = require(`${prefix}vanilla-to-angular.ts`);
    const {getIntegratedDarkModeCode} = require(`${prefix.replace('grid-','')}parser-utils.ts`);

    return [parser, vanillaToVue, vanillaToVue3, vanillaToReactFunctional, vanillaToReactFunctionalTs, vanillaToAngular, vanillaToTypescript, getIntegratedDarkModeCode];
}

function generateExamples(type, importTypes, scope, trigger, done) {
    const incremental = !!trigger;
    const exampleGenerator = createExampleGenerator(type, `./src/example-generation/${type}-`, importTypes, incremental);
    const regex = new RegExp(`<${type}-example.*?name=['"](.*?)['"].*?type=['"](.*?)['"](.*?options='(.*?)')?`, 'g');

    forEachExample(done, type, regex, exampleGenerator, scope, trigger);
}

module.exports.generateGridExamples = (scope, trigger, done, tsRegistered = false) => {
    try {
        if (!tsRegistered) {
            require('ts-node').register();
        }
        const importTypes = ['modules'];
        if (!skipPackages()) {
            importTypes.push('packages');
        }
        generateExamples('grid', importTypes, scope, trigger, done);
    } catch (e) {
        console.error('Failed to generate grid examples', e);

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

    return new Promise(resolve => module.exports.generateGridExamples(scope, trigger, () => resolve(), true));
};
