import { generateIndexHtml } from './index-html-generator';

const getInternalFramework = (framework, useFunctionalReact) => {
    if (framework === 'javascript') {
        return 'vanilla';
    } else if (framework === 'react' && useFunctionalReact) {
        return 'reactFunctional';
    }

    return framework;
};

export const getExampleInfo = (pageName, name, title, type, options, framework, importType, useFunctionalReact) => {
    const internalFramework = getInternalFramework(framework, useFunctionalReact);
    const boilerplatePath = `/example-runner/grid-${framework}-boilerplate/`;
    const sourcePath = `${pageName}/examples/${name}/_gen/${importType}/${internalFramework}/`;
    const appLocation = `/static/examples/${pageName}/${name}/${importType}/${internalFramework}/`;

    return {
        pageName,
        name,
        title,
        type,
        options: JSON.parse(options),
        framework,
        internalFramework,
        importType,
        sourcePath,
        boilerplatePath,
        appLocation,
    };
};

const getFrameworkFiles = framework => {
    if (framework === 'javascript') { return []; }

    let files = ['systemjs.config.js'];

    if (framework === 'angular') {
        files.unshift('main.ts', 'systemjs-angular-loader.js');
    }

    return files;
};

export const getExampleFiles = (nodes, exampleInfo) => {
    const { sourcePath, framework, boilerplatePath } = exampleInfo;

    const filesForExample = nodes
        .filter(node => node.relativePath.startsWith(sourcePath))
        .map(node => ({
            path: node.relativePath.replace(sourcePath, ''),
            publicURL: node.publicURL,
            isFramework: false
        }));

    getFrameworkFiles(framework).forEach(file => filesForExample.push({
        path: file,
        publicURL: boilerplatePath + file,
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
        source: generateIndexHtml(nodes, exampleInfo),
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
            addHiddenInput(`files[${key}]`, files[key].source);
        });

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    });
};

export const doOnEnter = (e, action) => {
    if (e.key && e.key === 'Enter') {
        action();
    }
};