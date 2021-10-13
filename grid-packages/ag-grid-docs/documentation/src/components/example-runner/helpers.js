import { withPrefix } from 'gatsby';
import { encodeQueryParams } from 'use-query-params';
import { stringify } from 'query-string';
import { agGridVersion, localPrefix } from 'utils/consts';
import { getIndexHtml } from './index-html-helper';
import { ParameterConfig } from '../../../pages/example-runner';
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
const getInternalFramework = (framework, useFunctionalReact, useVue3) => {
    if (framework === 'javascript') {
        return 'vanilla';
    } else if (framework === 'react' && useFunctionalReact) {
        return 'reactFunctional';
    } else if(framework === 'vue' && useVue3) {
        return 'vue3'
    }

    return framework;
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
    importType = 'modules') => {
    if (library === 'charts') {
        // no support for modules or React Hooks or Vue 3 in charts yet
        importType = 'packages';
        useFunctionalReact = false;
    }

    const internalFramework = getInternalFramework(framework, useFunctionalReact, useVue3);
    const boilerPlateFramework = framework === 'vue' ? useVue3 ? 'vue3' : 'vue' : framework;
    const boilerplatePath = `/example-runner/${library}-${boilerPlateFramework}-boilerplate/`;

    console.log("boilerplatePath", boilerplatePath);

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

        default:
            break;
    }

    if (type === 'vanilla') {
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

const getFrameworkFiles = framework => {
    if (framework === 'javascript') { return []; }

    let files = ['systemjs.config.js'];

    if (isDevelopment()) {
        files.push('systemjs.config.dev.js');
    }

    if (framework === 'angular') {
        files.unshift('main.ts', 'systemjs-angular-loader.js');
    }

    return files;
};

export const getExampleFiles = exampleInfo => {
    const { sourcePath, framework, boilerplatePath } = exampleInfo;

    const filesForExample = exampleInfo
        .getFiles()
        .map(node => ({
            path: node.relativePath.replace(sourcePath, ''),
            publicURL: node.publicURL,
            isFramework: false
        }));

    getFrameworkFiles(framework).forEach(file => filesForExample.push({
        path: file,
        publicURL: withPrefix(boilerplatePath + file),
        isFramework: true,
    }));

    const files = {};
    const promises = [];

    filesForExample.filter(f => f.path !== 'index.html').forEach(f => {
        files[f.path] = null; // preserve ordering

        const promise = fetch(f.publicURL)
            .then(response => response.text())
            .then(source => files[f.path] = { source, isFramework: f.isFramework });

        promises.push(promise);
    });

    files['index.html'] = {
        source: getIndexHtml(exampleInfo),
        isFramework: false,
    };

    return Promise.all(promises).then(() => files);
};

export const openPlunker = exampleInfo => {
    const { title } = exampleInfo;

    getExampleFiles(exampleInfo).then(files => {
        const form = document.createElement('form');
        form.method = 'post';
        form.style.display = 'none';
        form.action = '//plnkr.co/edit/?p=preview';
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
        ['alpine-dark', 'alpine', 'balham-dark', 'balham', 'material', 'fresh', 'dark', 'blue', 'bootstrap'];

    const cssFiles = [
        'ag-grid.css',
        ...themeFiles.map(theme => `ag-theme-${theme}.css`)
    ];

    const getCssFilePath = file => isUsingPublishedPackages() ?
        `https://unpkg.com/@ag-grid-community/all-modules@${agGridVersion}/dist/styles/${file}` :
        `${localPrefix}/@ag-grid-community/all-modules/dist/styles/${file}`;

    return cssFiles.map(getCssFilePath);
};

export const getEntryFile = framework => {
    const entryFile = {
        'react': 'index.jsx',
        'angular': 'app/app.component.ts'
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
