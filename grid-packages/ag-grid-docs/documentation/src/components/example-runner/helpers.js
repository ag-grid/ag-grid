import { withPrefix } from 'gatsby';
import { agGridVersion, localPrefix, getLocalPrefix } from './consts';
import { getIndexHtml } from './index-html-helper';

const getInternalFramework = (framework, useFunctionalReact) => {
    if (framework === 'javascript') {
        return 'vanilla';
    } else if (framework === 'react' && useFunctionalReact) {
        return 'reactFunctional';
    }

    return framework;
};

export const getExampleInfo = (nodes, library, pageName, name, title, type, options, framework, importType, useFunctionalReact) => {
    if (library === 'charts') {
        // no support for modules or React Hooks in charts yet
        importType = 'packages';
        useFunctionalReact = false;
    }

    const internalFramework = getInternalFramework(framework, useFunctionalReact);
    const boilerplatePath = `/example-runner/${library}-${framework}-boilerplate/`;

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

export const openPlunker = (nodes, exampleInfo) => {
    const { title } = exampleInfo;

    getExampleFiles(nodes, exampleInfo).then(files => {
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
            let { source } = files[key];

            if (isDevelopment() && window.location) {
                // swap out to match hostname so Plunkers from localhost can be shared
                source = source.replace(new RegExp(localPrefix, 'g'), getLocalPrefix(`${window.location.hostname}:8080`));
            }

            addHiddenInput(`files[${key}]`, source);
        });

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    });
};

export const isDevelopment = () => process.env.NODE_ENV === 'development';
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
