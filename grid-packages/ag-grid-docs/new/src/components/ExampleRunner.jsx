import React, { useState } from "react";
import { useStaticQuery, graphql } from "gatsby";
import './example-runner.css';
import Prism from 'prismjs';

export default function ExampleRunner({ framework, name, title, type, options = '{}' }) {
    const parsedOptions = JSON.parse(options);

    return <div className="example-runner">
        <strong>Example: {title}</strong><br />

        <CodeViewer framework={framework} name={name} />
    </div>;
}

const CodeViewer = ({ framework, name, imports = 'modules' }) => {
    const [files, setFiles] = useState(null);
    const [activeFile, setActiveFile] = useState(null);

    const defaultFile = {
        'react': 'index.jsx',
        'angular': 'app/app.component.ts'
    };

    const mainFile = defaultFile[framework] || 'main.js';

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

    if (framework === 'javascript') {
        framework = 'vanilla';
    }

    if (files == null && typeof window !== 'undefined') {
        const rootFolder = `${name}/_gen/${imports}/${framework}/`;
        const filesForExample = data.allFile.edges
            .filter(edge => edge.node.relativePath.startsWith(rootFolder))
            .map(edge => ({ path: edge.node.relativePath.replace(rootFolder, ''), publicURL: edge.node.publicURL }));

        filesForExample.forEach(f => {
            fetch(f.publicURL).then(response => response.text().then(text => f.code = text)).then(() => {
                if (f.path === mainFile) {
                    setActiveFile(f);
                }
            });
        });

        setFiles(filesForExample);
    }

    return <div className="code-viewer">
        <div className="code-viewer__files">{files && files.map(f => <FileItem key={f.path} path={f.path} isActive={activeFile === f} onClick={() => setActiveFile(f)} />)}</div>
        <div className="code-viewer__code">
            {activeFile && <FileView path={activeFile.path} code={activeFile.code} />}
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
