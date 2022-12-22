import React, { useEffect, useState } from 'react';
import classnames from 'classnames';
import isServerSideRendering from 'utils/is-server-side-rendering';
import { getEntryFile, getExampleFiles } from './helpers';
import { doOnEnter } from 'components/key-handlers';
import styles from './CodeViewer.module.scss';
import Code from '../Code';

/**
 * This renders the code viewer in the example runner.
 */
const CodeViewer = ({ isActive, exampleInfo }) => {
    const [files, setFiles] = useState(null);
    const [activeFile, setActiveFile] = useState(null);

    let unmount = false;
    const didUnmount = () => unmount;

    useEffect(() => {
        updateFiles(exampleInfo, setFiles, setActiveFile, didUnmount);
        return () => unmount = true;
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
            {files && activeFile && files[activeFile] && <FileView key={activeFile} path={activeFile} code={files[activeFile].source} />}
        </div>
    </div>;
};

const updateFiles = (exampleInfo, setFiles, setActiveFile, didUnmount) => {
    if (isServerSideRendering()) { return; }

    const { framework, internalFramework } = exampleInfo;

    getExampleFiles(exampleInfo).then(files => {
        if (didUnmount()) { return; }

        setFiles(files);

        const entryFile = getEntryFile(framework, internalFramework);

        if (files[entryFile]) {
            setActiveFile(entryFile);
        } else {
            setActiveFile(Object.keys(files).sort()[0]);
        }
    });
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

const ExtensionMap = {
    sh: 'bash',
    vue: 'html',
    tsx: 'jsx',
    json: 'js'
};

const FileView = ({ path, code }) => {
    const parts = path.split('.');
    const extension = parts[parts.length - 1];

    return <Code code={code} language={ExtensionMap[extension] || extension} />;
};

export default CodeViewer;