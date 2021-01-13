import React, { useEffect, useState } from 'react';
import classnames from 'classnames';
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-diff';
import 'prismjs/components/prism-scss';
import isServerSideRendering from '../../utils/is-server-side-rendering';
import { getEntryFile, getExampleFiles } from './helpers';
import { doOnEnter } from '../key-handlers';
import styles from './CodeViewer.module.scss';

const updateFiles = (exampleInfo, setFiles, setActiveFile) => {
    if (isServerSideRendering()) { return; }

    const { framework } = exampleInfo;

    getExampleFiles(exampleInfo).then(files => {
        setFiles(files);

        const entryFile = getEntryFile(framework);

        if (files[entryFile]) {
            setActiveFile(entryFile);
        } else {
            setActiveFile(Object.keys(files).sort()[0]);
        }
    });
};

const CodeViewer = ({ isActive, exampleInfo }) => {
    const [files, setFiles] = useState(null);
    const [activeFile, setActiveFile] = useState(null);

    useEffect(() => {
        updateFiles(exampleInfo, setFiles, setActiveFile);
    }, [exampleInfo]);

    const keys = files ? Object.keys(files).sort() : [];
    const exampleFiles = keys.filter(key => !files[key].isFramework);
    const frameworkFiles = keys.filter(key => files[key].isFramework);

    return <div className={classnames(styles['code-viewer'], { [styles['code-viewer--hidden']]: !isActive })}>
        <div className={styles['code-viewer__files']}>
            {frameworkFiles.length > 0 && <div className={styles['code-viewer__file-title']}>App</div>}
            {exampleFiles.map(path => <FileItem key={path} path={path} isActive={activeFile === path} onClick={() => setActiveFile(path)} />)}
            {frameworkFiles.length > 0 &&
                <>
                    <div className={styles['code-viewer__file-title']}>Framework</div>
                    {frameworkFiles.map(path => <FileItem key={path} path={path} isActive={activeFile === path} onClick={() => setActiveFile(path)} />)}
                </>}
        </div>
        <div className={styles['code-viewer__code']}>
            {!files && <FileView path={'loading.js'} code={'// Loading...'} />}
            {files && activeFile && <FileView key={activeFile} path={activeFile} code={files[activeFile].source} />}
        </div>
    </div>;
};

const FileItem = ({ path, isActive, onClick }) =>
    <div
        className={classnames(styles['code-viewer__file'], { [styles['code-viewer__file--active']]: isActive })}
        title={path}
        onClick={onClick}
        onKeyDown={e => doOnEnter(e, onClick)}
        role="button"
        tabIndex="0">
        {path}
    </div>;

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

    return <pre className="language-"><code dangerouslySetInnerHTML={{ __html: Prism.highlight(code || '', LanguageMap[extension]) }}></code></pre>;
};

export default CodeViewer;