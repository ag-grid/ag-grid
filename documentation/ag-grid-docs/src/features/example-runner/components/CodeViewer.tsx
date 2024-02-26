import type { InternalFramework } from '@ag-grid-types';
import Code from '@components/Code';
import { Icon } from '@components/icon/Icon';
import styles from '@design-system/modules/CodeViewer.module.scss';
import type { ExampleType, FileContents } from '@features/example-generator/types';
import { doOnEnter } from '@utils/doOnEnter';
import classnames from 'classnames';
import { useEffect, useState } from 'react';

import { CodeOptions } from './CodeOptions';

export const DARK_MODE_START = '/** DARK MODE START **/';
export const DARK_MODE_END = '/** DARK MODE END **/';

const startDelimiter = DARK_MODE_START;
const endDelimiter = DARK_MODE_END;
const escapedStart = startDelimiter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const escapedEnd = endDelimiter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const regex = new RegExp(`\\s*${escapedStart}[\\s\\S]*?${escapedEnd}\\s*`, 'g');

const ExtensionMap = {
    sh: 'bash',
    vue: 'html',
    tsx: 'jsx',
    json: 'js',
};

function stripOutDarkModeCode(files: FileContents) {
    const mainFiles = ['main.js', 'main.ts', 'index.tsx', 'index.jsx', 'app.component.ts'];
    mainFiles.forEach((mainFile) => {
        if (files[mainFile]) {
            files[mainFile] = files[mainFile].replace(regex, '').trim() + '\n';
        }
    });
}

/**
 * This renders the code viewer in the example runner.
 */
export const CodeViewer = ({
    id,
    isActive,
    files,
    initialSelectedFile,
    exampleType,
    internalFramework,
    hideInternalFrameworkSelection,
}: {
    id: string;
    isActive?: boolean;
    files: FileContents;
    initialSelectedFile: string;
    internalFramework: InternalFramework;
    exampleType: ExampleType;
    hideInternalFrameworkSelection?: boolean;
}) => {
    const [activeFile, setActiveFile] = useState(initialSelectedFile);
    const [showFiles, setShowFiles] = useState(true);

    const exampleFiles = Object.keys(files);
    stripOutDarkModeCode(files);

    useEffect(() => {
        setActiveFile(initialSelectedFile);
    }, [initialSelectedFile]);

    return (
        <div className={classnames(styles.codeViewer, { [styles.hidden]: !isActive, [styles.hideFiles]: !showFiles })}>
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
            <div className={styles.inner}>
                <div className={styles.files}>
                    <ul className="list-style-none">
                        {exampleFiles.map((path) => (
                            <FileItem
                                key={path}
                                path={path}
                                isActive={activeFile === path}
                                onClick={() => {
                                    setActiveFile(path);
                                }}
                            />
                        ))}
                    </ul>
                    {!hideInternalFrameworkSelection && (
                        <CodeOptions id={id} internalFramework={internalFramework} exampleType={exampleType} />
                    )}
                </div>
                <div className={styles.code}>
                    {!files && <FileView path={'loading.js'} code={'// Loading...'} />}
                    {files && activeFile && files[activeFile] && (
                        <FileView key={activeFile} path={activeFile} code={files[activeFile]} />
                    )}
                </div>
            </div>
        </div>
    );
};

const FileItem = ({ path, isActive, onClick }) => (
    <li>
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

const FileView = ({ path, code }) => {
    const parts = path.split('.');
    const extension = parts[parts.length - 1];

    return <Code code={code} language={ExtensionMap[extension] || extension} lineNumbers={true} />;
};
