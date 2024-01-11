import classnames from 'classnames';
import { doOnEnter } from 'components/key-handlers';
import React, { useEffect, useMemo, useState } from 'react';
import isServerSideRendering from 'utils/is-server-side-rendering';
import Code from '../Code';
import { Icon } from '../Icon';
import CodeOptions from './CodeOptions';
import styles from '@design-system/modules/CodeViewer.module.scss';
import { getEntryFile, getExampleFiles, stripOutDarkModeCode} from './helpers';
import { trackExampleRunnerEvent } from './track-example-runner-event';

/**
 * This renders the code viewer in the example runner.
 */
const CodeViewer = ({ isActive, exampleInfo }) => {
    const [files, setFiles] = useState(null);
    const [activeFile, setActiveFile] = useState(null);
    const [showFiles, setShowFiles] = useState(true);

    let unmount = false;
    const didUnmount = () => unmount;

    useEffect(() => {
        updateFiles(exampleInfo, setFiles, setActiveFile, didUnmount);
        return () => (unmount = true);
    }, [exampleInfo]);

    const keys = files ? Object.keys(files).sort() : [];
    const exampleFiles = useMemo(() => keys.filter((key) => {
        if (files[key].isFramework) { return false; }
        return !key.endsWith('.css') && !key.endsWith('.html') && key !== 'interfaces.ts';
    }), [files]);

    return (
        <div className={classnames(styles.codeViewer, styles.codeViewerBorder, { [styles.hidden]: !isActive, [styles.hideFiles]: !showFiles })}>
            <div className={styles.mobileHeader}>
                <button
                    className={'button-style-none button-as-link'}
                    onClick={() => {
                        setShowFiles((prevShowFiles) => !prevShowFiles);
                    }}
                >
                    {showFiles ? (
                        <span>
                            Hide files
                            <Icon name="arrowLeft" />
                        </span>
                    ) : (
                        <span>
                            Show files
                            <Icon name="arrowRight" />
                        </span>
                    )}
                </button>
                <span>
                    <span className="text-secondary">Viewing: </span>
                    {activeFile}
                </span>
            </div>
            <div className={styles.inner} style={{ flexDirection: 'column' }}>
                {exampleFiles.length > 1 && (<div className={styles.files} style={{ flexDirection: 'row' }}>
                    <ul className="list-style-none">
                        {exampleFiles.map((path) => (
                            <FileItem
                                key={path}
                                path={path}
                                isActive={activeFile === path}
                                onClick={() => {
                                    setActiveFile(path);
                                    trackExampleRunnerEvent({
                                        type: 'viewFileClick',
                                        exampleInfo,
                                        extraProps: {
                                            filePath: path,
                                        },
                                    });
                                }}
                            />
                        ))}
                    </ul>
                </div>)}
                <div className={styles.code}>
                    {!files && <FileView path={'loading.js'} code={'// Loading...'} />}
                    {files && activeFile && files[activeFile] && (
                        <FileView key={activeFile} path={activeFile} code={files[activeFile].source} />
                    )}
                </div>
            </div>
        </div>
    );
};

const updateFiles = (exampleInfo, setFiles, setActiveFile, didUnmount) => {
    if (isServerSideRendering()) {
        return;
    }

    const { framework, internalFramework } = exampleInfo;

    getExampleFiles(exampleInfo).then((exampleFiles) => {
        const files = exampleFiles.plunker;
        if (didUnmount()) {
            return;
        }
        stripOutDarkModeCode(files);

        setFiles(files);

        const entryFile = getEntryFile(framework, internalFramework);

        if (files[entryFile]) {
            setActiveFile(entryFile);
        } else {
            setActiveFile(Object.keys(files).sort()[0]);
        }
    });
};

const FileItem = ({ path, isActive, onClick }) => (
    <li style={{ display: 'inline-block' }}>
        <button
            className={classnames('button-style-none', styles.file, { [styles.isActive]: isActive })}
            title={path}
            onClick={onClick}
            onKeyDown={(e) => doOnEnter(e, onClick)}
            tabIndex="0"
        >
            {path}
        </button>
    </li>
);

const ExtensionMap = {
    sh: 'bash',
    vue: 'html',
    tsx: 'jsx',
    json: 'js',
};

const FileView = ({ path, code }) => {
    const parts = path.split('.');
    const extension = parts[parts.length - 1];
    const processedCode = useMemo(() => {
        // search code for tags
        return code.replace(/.*START-EXAMPLE(\n)*/s, "").replace(/\n\/\/ END-EXAMPLE.*/s, "");
    }, [code]);

    return <Code code={processedCode} language={ExtensionMap[extension] || extension} lineNumbers={true} />;
};

export default CodeViewer;
