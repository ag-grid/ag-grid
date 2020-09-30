import React, { useEffect, useState } from "react";
import { useStaticQuery, graphql } from "gatsby";
import './code-viewer.css';
import Prism from 'prismjs';

const updateFiles = (data, name, framework, useFunctionalReact, importType, setFiles, setActiveFile) => {
    if (typeof window === 'undefined') { return; }

    const defaultFile = {
        'react': 'index.jsx',
        'angular': 'app/app.component.ts'
    };

    const mainFile = defaultFile[framework] || 'main.js';

    setActiveFile(mainFile);

    if (framework === 'javascript') {
        framework = 'vanilla';
    } else if (framework === 'react' && useFunctionalReact) {
        framework = 'reactFunctional';
    }

    const rootFolder = `${name}/_gen/${importType}/${framework}/`;
    const filesForExample = data.allFile.edges
        .filter(edge => edge.node.relativePath.startsWith(rootFolder))
        .map(edge => ({ path: edge.node.relativePath.replace(rootFolder, ''), publicURL: edge.node.publicURL }));

    const files = {};
    const promises = [];

    filesForExample.forEach(f => {
        files[f.path] = null; // preserve ordering
        promises.push(fetch(f.publicURL).then(response => response.text()).then(text => files[f.path] = text));
    });

    Promise.all(promises).then(() => setFiles(files));
};

const CodeViewer = ({ framework, name, importType = 'modules', useFunctionalReact = false }) => {
    const [files, setFiles] = useState(null);
    const [activeFile, setActiveFile] = useState(null);

    const data = useStaticQuery(graphql`
    {
        allFile(filter: { sourceInstanceName: { eq: "examples" } }) {
            edges {
                node {
                    relativePath
                    publicURL
                }
            }
        }
    }
    `);

    useEffect(
        () => updateFiles(data, name, framework, useFunctionalReact, importType, setFiles, setActiveFile),
        [data, name, framework, useFunctionalReact, importType]);

    return <div className="code-viewer">
        <div className="code-viewer__files">{files && Object.keys(files).map(path => <FileItem key={path} path={path} isActive={activeFile === path} onClick={() => setActiveFile(path)} />)}</div>
        <div className="code-viewer__code">
            {!files && <div>Loading...</div>}
            {files && activeFile && <FileView path={activeFile} code={files[activeFile]} />}
        </div>
    </div>;
};

const FileItem = ({ path, isActive, onClick }) => <div className={`code-viewer__file ${isActive ? 'code-viewer__file--active' : ''}`} onClick={onClick}>{path}</div>;

const LanguageMap = {
    js: Prism.languages.javascript,
    ts: Prism.languages.typescript,
    css: Prism.languages.css,
    sh: Prism.languages.bash,
    html: Prism.languages.html,
    jsx: Prism.languages.jsx,
    java: Prism.languages.java,
    sql: Prism.languages.sql,
    vue: Prism.languages.html,
    diff: Prism.languages.diff,
    scss: Prism.languages.scss
};

const FileView = ({ path, code }) => {
    const parts = path.split('.');
    const extension = parts[parts.length - 1];

    return <pre className="language-"><code dangerouslySetInnerHTML={{ __html: Prism.highlight(code, LanguageMap[extension]) }}></code></pre>;
};

export default CodeViewer;