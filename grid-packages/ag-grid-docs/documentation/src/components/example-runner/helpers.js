import {withPrefix} from 'gatsby';
import {stringify} from 'query-string';
import {getParameters} from "codesandbox/lib/api/define";
import {agGridVersion, localPrefix} from 'utils/consts';
import isDevelopment from 'utils/is-development';
import {getIndexHtml} from './index-html-helper';

export const DARK_MODE_START = '/** DARK MODE START **/';
export const DARK_MODE_END = '/** DARK MODE END **/';

export function stripOutDarkModeCode(files) {
    const mainFiles = ['main.js', 'main.ts', 'index.tsx', 'index.jsx', 'app.component.ts'];
    const defaultTheme = document.documentElement.dataset.darkMode?.toUpperCase()  === 'TRUE' ? 'ag-theme-quartz-dark' : 'ag-theme-quartz';
    mainFiles.forEach((mainFile) => {
        if (files[mainFile]) {

            // Integrated charts examples can only be viewed in light mode so that chart and grid match
            const useDefaultTheme = !files[mainFile].source?.includes('DARK INTEGRATED START');

            // Hide theme switcher
            files[mainFile].source = files[mainFile].source?.replace(/\/\*\* DARK MODE START \*\*\/([\s\S]*?)\/\*\* DARK MODE END \*\*\//g, `"${ useDefaultTheme ? defaultTheme : 'ag-theme-quartz'}"`);

            // hide integrated theme switcher
            files[mainFile].source = files[mainFile].source?.replace(/\/\*\* DARK INTEGRATED START \*\*\/([\s\S]*?)\/\*\* DARK INTEGRATED END \*\*\//g, '');
        }
    });
   /* RTI-1751 Would break JS master detail example that provides a grid too,
   if (files['index.html']) {        
        files['index.html'].source = files['index.html'].source?.replace(/(['"\s])ag-theme-quartz(['"\s])/g, "$1" + defaultTheme + "$2");
    } */
}

/**
 * The "internalFramework" is the framework name we use inside the example runner depending on which options the
 * user has selected. It can be one of the following:
 *
 * - 'vanilla' (JavaScript)
 * - 'reactFunctional' (React Hooks)
 * - 'reactFunctionalTs' (React Hooks with Typescript)
 * - 'angular' (Angular)
 * - 'vue' (Vue)
 * - 'vue3' (Vue 3)
 */
const getInternalFramework = (framework, useVue3, useTypescript) => {
    switch (framework) {
        case 'vue':
            return useVue3 ? 'vue3' : 'vue';
        case 'javascript':
            return useTypescript ? 'typescript' : 'vanilla';
        case 'react':
            return useTypescript ? 'reactFunctionalTs' : 'reactFunctional';
        default:
            return framework;
    }
};

export const getExampleInfo = (
    nodes,
    library,
    pageName,
    name,
    title,
    type,
    options = {},
    framework = 'javascript',
    useVue3 = false,
    useTypescript = false,
    importType = 'modules',
    set
) => {
    if (library === 'charts') {
        // no support for modules
        importType = 'packages';
    }

    const internalFramework = getInternalFramework(framework, useVue3, useTypescript);

    let boilerPlateFramework;
    switch (framework) {
        case 'vue':
            boilerPlateFramework = useVue3 ? 'vue3' : 'vue';
            break;
        case 'javascript':
            boilerPlateFramework = useTypescript ? 'typescript' : 'javascript';
            break;
        case 'react':
            boilerPlateFramework = useTypescript && internalFramework === 'reactFunctionalTs' ? 'react-ts' : 'react';
            break;
        default:
            boilerPlateFramework = framework;
    }

    const boilerplatePath = `/example-runner/${library}-${boilerPlateFramework}-boilerplate/`;

    let sourcePath = `${pageName}/examples/${name}/`;
    let appLocation = `/examples/${pageName}/${name}/`;

    switch (type) {
        case 'generated':
        case 'mixed':
            sourcePath += `_gen/${importType}/${internalFramework}/`;
            appLocation += `${importType}/${internalFramework}/`;
            break;

        case 'multi':
            sourcePath += `${internalFramework}/`;
            appLocation += `${internalFramework}/`;
            break;

        case 'typescript':
            // We always want to see the vanilla or typescript version of the code despite sometimes being on a different framework page
            const location =
                internalFramework === 'vanilla' || internalFramework === 'typescript' ? internalFramework : 'vanilla';

            sourcePath += `_gen/${importType}/${location}/`;
            appLocation += `${importType}/${location}/`;
            break;
        default:
            break;
    }

    if (type === 'vanilla' || type === 'typescript') {
        // Override so even if viewing a framework the example only shows the javascript version.
        framework = 'javascript';
    }

    return {
        library,
        pageName,
        name,
        title,
        type,
        options,
        framework,
        internalFramework,
        importType,
        sourcePath,
        boilerplatePath,
        appLocation,
        getFile: (name) => nodes.filter((file) => file.relativePath === sourcePath + name)[0],
        getFiles: (extension, exclude = () => false) =>
            nodes.filter(
                (file) =>
                    file.relativePath.startsWith(sourcePath) &&
                    (!extension || file.base.endsWith(`.${extension}`)) &&
                    !exclude(file)
            ),
        set,
    };
};

const getFrameworkFiles = (framework, internalFramework) => {
    if (framework === 'javascript' && internalFramework !== 'typescript') {
        return [];
    }

    // spl temporary css loader
    let files = ['css.js'];

    if (isDevelopment()) {
        files.push('systemjs.config.dev.js');
    }else{
        files.push('systemjs.config.js');
    }

    return files;
};

export const getExampleFiles = (exampleInfo, forPlunker = false) => {
    const {sourcePath, framework, internalFramework, boilerplatePath, library} = exampleInfo;

    const filesForExample = exampleInfo.getFiles().map((node) => ({
        path: node.relativePath.replace(sourcePath, ''),
        publicURL: node.publicURL,
        isFramework: false,
        content: node.content,
    }));

    getFrameworkFiles(framework, internalFramework).forEach((file) =>
        filesForExample.push({
            path: file,
            publicURL: withPrefix(boilerplatePath + file),
            isFramework: true,
        })
    );

    const files = {
        plunker: {},
        csb: {}
    };
    const promises = [];

    filesForExample
        .filter((f) => {
            const isIndexFile = f.path === 'index.html';
            if (forPlunker) {
                return !isIndexFile;
            } else {
                const isPackageFile = f.path === 'package.json';
                return !isIndexFile && !isPackageFile;
            }
        })
        .forEach((f) => {
            files.plunker[f.path] = null;   // preserve ordering
            files.csb[f.path] = null;       // preserve ordering

            const sourcePromise = f.content ?? fetch(f.publicURL).then((response) => response.text());
            const promise = sourcePromise.then((source) => {
                if (forPlunker && f.path === 'main.js') {
                    if (library === 'grid') {
                        source = source.replace(
                            `const columnDefs = [`,
                            `/** @type {(import('ag-grid-community').ColDef | import('ag-grid-community').ColGroupDef )[]} */\nconst columnDefs = [`
                        );
                        source = source.replace(
                            `const gridOptions = {`,
                            `/** @type {import('ag-grid-community').GridOptions} */\nconst gridOptions = {`
                        );
                    }
                }

                files.plunker[f.path] = {source, isFramework: f.isFramework};
                files.csb[f.path] = {source, isFramework: f.isFramework};
            });

            promises.push(promise);
        });

    const { plunkerIndexHtml, codeSandBoxIndexHtml } = getIndexHtml(exampleInfo);

    files.plunker['index.html'] = {
        source: plunkerIndexHtml,
        isFramework: framework !== 'javascript' // only show index.html for javascript examples
    };
    files.csb['index.html'] = {
        source: codeSandBoxIndexHtml,
        isFramework: framework !== 'javascript' // only show index.html for vanilla examples
    };

    return Promise.all(promises).then(() => files);
};

export const openPlunker = (exampleInfo) => {
    const {title, framework, internalFramework} = exampleInfo;

    getExampleFiles(exampleInfo, true).then((exampleFiles) => {
        const files = exampleFiles.plunker;
        stripOutDarkModeCode(files);
        // Let's open the grid configuration file by default
        const fileToOpen = getEntryFile(framework, internalFramework);

        const form = document.createElement('form');
        form.method = 'post';
        form.style.display = 'none';
        form.action = `//plnkr.co/edit/?preview&open=${fileToOpen}`;
        form.target = '_blank';

        const addHiddenInput = (name, value) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = name;
            input.value = value;

            form.appendChild(input);
        };

        addHiddenInput('tags[0]', 'ag-grid');
        addHiddenInput('tags[1]', 'example');
        addHiddenInput('private', true);
        addHiddenInput('description', title);

        const supportedFrameworks = new Set(['angular', 'typescript', 'reactFunctionalTs', 'vanilla', 'javascript'])
        const include = key => {
            if (key === 'package.json' && !supportedFrameworks.has(internalFramework)) {
                return false;
            }

            return true;
        }

        Object.keys(files)
            .filter(include)
            .forEach((key) => {
            addHiddenInput(`files[${key}]`, files[key].source);
        });

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    });
};

export const openCodeSandbox = (exampleInfo) => {
    const {title, framework, internalFramework} = exampleInfo;

    getExampleFiles(exampleInfo, true).then((exampleFiles) => {
        const files = exampleFiles.csb;
        stripOutDarkModeCode(files);

        const form = document.createElement('form');
        form.method = 'post';
        form.style.display = 'none';
        form.action = `//codesandbox.io/api/v1/sandboxes/define`;
        form.target = '_blank';

        function isFrameworkReact() {
            return new Set(['reactFunctional', 'reactFunctionalTs']).has(internalFramework);
        }

        const getTemplateForInternalFramework = () => {
            switch (internalFramework) {
                case 'reactFunctional':
                    return 'create-react-app';
                case 'reactFunctionalTs':
                    return 'create-react-app-typescript';
                default:
                    return 'static';
            }
        }

        const getPathForFile = file => {
            if (!isFrameworkReact()) {
                return file;
            }

            if (file === 'index.html') {
                return `public/index.html`
            }

            if (/([a-zA-Z0-9\\s_.])+(.js|.jsx|.tsx|.ts|.css)$/.test(file)) {
                if (file.endsWith(".js")) {
                    return `public/${file}`;
                }

                if (file.startsWith('index.')) {
                    return `src/${file === 'index.jsx' ? 'index.js' : file}`;
                }

                if (file === 'styles.css') {
                    return `src/styles.css`
                }
                return `src/${file}`;
            }

            return file;
        }

        const exclude = key => isFrameworkReact() && ['systemjs.config.js', 'systemjs.config.dev.js', 'css.js'].includes(key)

        const filesToSubmit = {};
        Object.keys(files)
            .filter((key) => !exclude(key))
            .forEach((key) => {
                filesToSubmit[getPathForFile(key)] = {content: files[key].source};
            });

        const parameters = getParameters({
            files: filesToSubmit,
            template: getTemplateForInternalFramework()
        });


        const addHiddenInput = (name, value) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = name;
            input.value = value;

            form.appendChild(input);
        };

        addHiddenInput('tags[0]', 'ag-grid');
        addHiddenInput('tags[1]', 'example');
        addHiddenInput('private', true);
        addHiddenInput('description', title);
        addHiddenInput('parameters', parameters);

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    });
};

export const isUsingPublishedPackages = () => process.env.GATSBY_USE_PUBLISHED_PACKAGES === 'true';

export const getCssFilePaths = (importType, theme) => {
    const themeFiles = theme ? [theme] : ['quartz', 'alpine', 'balham', 'material'];

    const cssFiles = ['ag-grid.css', ...themeFiles.map((theme) => `ag-theme-${theme}.css`)];

    const agCommunityPackage = importType === 'packages' ? 'ag-grid-community' : '@ag-grid-community';

    const getCssFilePath = (file) =>
        isUsingPublishedPackages()
            ? `https://cdn.jsdelivr.net/npm/@ag-grid-community/styles@${agGridVersion}/styles/${file}`
            : `${localPrefix}/${agCommunityPackage}/styles/${file}`;

    return cssFiles.map(getCssFilePath);
};

export const getEntryFile = (framework, internalFramework) => {
    const entryFile = {
        react: internalFramework === 'reactFunctionalTs' ? 'index.tsx' : 'index.jsx',
        angular: 'app.component.ts',
        javascript: internalFramework === 'typescript' ? 'main.ts' : 'main.js',
    };

    return entryFile[framework] || 'main.js';
};

export const getIndexHtmlUrl = (exampleInfo) => {
    if (isDevelopment()) {
        const {
            pageName,
            library,
            framework,
            useVue3,
            importType,
            name,
            title,
            type,
            options,
        } = exampleInfo;

        const queryParams = {
            pageName: encodeURIComponent(pageName),
            library: encodeURIComponent(library),
            framework: encodeURIComponent(framework),
            useVue3: encodeURIComponent(useVue3),
            importType: encodeURIComponent(importType),
            name: encodeURIComponent(name),
            title: encodeURIComponent(title),
            type: encodeURIComponent(type),
            options: encodeURIComponent(options),
        };

        return withPrefix(`/example-runner/?${stringify(queryParams)}`);
    } else {
        return withPrefix(`${exampleInfo.appLocation}index.html`);
    }
};
