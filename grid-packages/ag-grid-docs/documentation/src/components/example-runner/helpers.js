import { withPrefix } from 'gatsby';
import { encodeQueryParams } from 'use-query-params';
import { stringify } from 'query-string';
import { agGridVersion, localPrefix } from 'utils/consts';
import { getIndexHtml } from './index-html-helper';
import { ParameterConfig } from '../../pages/example-runner';
import isDevelopment from 'utils/is-development';

/**
 * The "internalFramework" is the framework name we use inside the example runner depending on which options the
 * user has selected. It can be one of the following:
 *
 * - 'vanilla' (JavaScript)
 * - 'react' (React Classes)
 * - 'reactFunctional' (React Hooks)
 * - 'angular' (Angular)
 * - 'vue' (Vue)
 * - 'vue3' (Vue 3)
 */
const getInternalFramework = (framework, useFunctionalReact, useVue3, useTypescript) => {
    switch (framework) {
        case 'vue':
            return useVue3 ? 'vue3' : 'vue';
        case 'javascript':
            return useTypescript ? 'typescript' : 'vanilla';
        case 'react':
            return useFunctionalReact
                ? useTypescript ? 'reactFunctionalTs' : 'reactFunctional'
                : 'react';
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
    useFunctionalReact = false,
    useVue3 = false,
    useTypescript = false,
    importType = 'modules') => {
    if (library === 'charts') {
        // no support for modules or React Hooks or Vue 3 in charts yet
        importType = 'packages';
        useFunctionalReact = false;
    }

    const internalFramework = getInternalFramework(framework, useFunctionalReact, useVue3, useTypescript);

    let boilerPlateFramework;
    switch (framework) {
        case 'vue':
            boilerPlateFramework = useVue3 ? 'vue3' : 'vue';
            break;
        case 'javascript':
            boilerPlateFramework = useTypescript ? 'typescript' : 'javascript';
            break;
        case 'react':
            boilerPlateFramework = (useTypescript && library === 'grid') ? 'react-ts' : 'react';
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
            const location = internalFramework === 'vanilla' || internalFramework === 'typescript' ? internalFramework : 'vanilla'

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
        getFile: name => nodes.filter(file => file.relativePath === sourcePath + name)[0],
        getFiles: (extension, exclude = () => false) =>
            nodes.filter(file => file.relativePath.startsWith(sourcePath) &&
                (!extension || file.base.endsWith(`.${extension}`)) &&
                !exclude(file)
            )
    };
};

const getFrameworkFiles = (framework, internalFramework) => {
    if (framework === 'javascript' && internalFramework !== 'typescript') { return []; }

    let files = ['systemjs.config.js'];

    if (isDevelopment()) {
        files.push('systemjs.config.dev.js');
    }

    if (framework === 'angular') {
        files.unshift('main.ts', 'systemjs-angular-loader.js');
    }

    return files;
};

export const getExampleFiles = (exampleInfo, includePackageFile = false) => {
    const { sourcePath, framework, internalFramework, boilerplatePath } = exampleInfo;

    const filesForExample = exampleInfo
        .getFiles()
        .map(node => ({
            path: node.relativePath.replace(sourcePath, ''),
            publicURL: node.publicURL,
            isFramework: false,
            content: node.content,
        }));

    getFrameworkFiles(framework, internalFramework).forEach(file => filesForExample.push({
        path: file,
        publicURL: withPrefix(boilerplatePath + file),
        isFramework: true,
    }));

    const files = {};
    const promises = [];

    filesForExample.filter(f => {

        const isIndexFile = f.path === 'index.html';
        if (includePackageFile) {
            return !isIndexFile;
        } else {
            const isPackageFile = f.path === 'package.json';
            return !isIndexFile && !isPackageFile;
        }

    }).forEach(f => {
        files[f.path] = null; // preserve ordering

        const sourcePromise = (f.content ?? fetch(f.publicURL).then(response => response.text()));
        const promise = sourcePromise
            .then(source => {
                files[f.path] = { source, isFramework: f.isFramework }
            });

        promises.push(promise);
    });

    files['index.html'] = {
        source: getIndexHtml(exampleInfo),
        isFramework: false,
    };

    return Promise.all(promises).then(() => files);
};

export const openPlunker = exampleInfo => {
    const { title, framework, internalFramework } = exampleInfo;

    getExampleFiles(exampleInfo, true).then(files => {

        // Let's open the grid configuration file by default
        const fileToOpen = getEntryFile(framework, internalFramework)

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

        Object.keys(files).forEach(key => {
            addHiddenInput(`files[${key}]`, files[key].source);
        });

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    });
};


export const isUsingPublishedPackages = () => process.env.GATSBY_USE_PUBLISHED_PACKAGES === 'true';

export const getCssFilePaths = theme => {
    const themeFiles = theme ?
        [theme] :
        ['alpine', 'balham', 'material'];

    const cssFiles = [
        'ag-grid.css',
        ...themeFiles.map(theme => `ag-theme-${theme}.css`)
    ];

    const getCssFilePath = file => isUsingPublishedPackages() ?
        `https://unpkg.com/@ag-grid-community/styles@${agGridVersion}/styles/${file}` :
        `${localPrefix}/@ag-grid-community/styles/${file}`;

    return cssFiles.map(getCssFilePath);
};

export const getEntryFile = (framework, internalFramework) => {
    const entryFile = {
        'react': internalFramework === 'reactFunctionalTs' ? 'index.tsx' : 'index.jsx',
        'angular': 'app/app.component.ts',
        'javascript': internalFramework === 'typescript' ? 'main.ts' : 'main.js'
    };

    return entryFile[framework] || 'main.js';
};

export const getIndexHtmlUrl = exampleInfo => {
    if (isDevelopment()) {
        const {
            pageName,
            library,
            framework,
            useFunctionalReact,
            useVue3,
            importType,
            name,
            title,
            type,
            options,
        } = exampleInfo;

        const queryParams = encodeQueryParams(
            ParameterConfig,
            {
                pageName,
                library,
                framework,
                useFunctionalReact,
                useVue3,
                importType,
                name,
                title,
                type,
                options,
            });

        return withPrefix(`/example-runner/?${stringify(queryParams)}`);
    } else {
        return withPrefix(`${exampleInfo.appLocation}index.html`);
    }
};
