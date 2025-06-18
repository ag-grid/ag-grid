import type { InternalFramework } from '@ag-grid-types';
import Code from '@ag-website-shared/components/code/Code';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import type { FileContents } from '@components/example-generator/types';
import { doOnEnter } from '@utils/doOnEnter';
import classnames from 'classnames';
import { useEffect, useState } from 'react';

import { CodeOptions } from './CodeOptions';
import styles from './CodeViewer.module.scss';

const ExtensionMap = {
    sh: 'bash',
    vue: 'html',
    tsx: 'jsx',
    json: 'js',
};

export const CONSOLE_LOG_START = '/** CONSOLE LOG START **/';
export const CONSOLE_LOG_END = '/** CONSOLE LOG END **/';

function getSnippetRegex({ startDelimiter, endDelimiter }: { startDelimiter: string; endDelimiter: string }) {
    const escapedStart = startDelimiter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedEnd = endDelimiter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\s*${escapedStart}[\\s\\S]*?${escapedEnd}\\s*`, 'g');

    return regex;
}

export function stripOutExampleGeneratorCode(files: FileContents) {
    const mainFiles = ['main.js', 'main.ts', 'index.tsx', 'index.jsx', 'app.component.ts'];
    const consoleLogRegex = getSnippetRegex({
        startDelimiter: CONSOLE_LOG_START,
        endDelimiter: CONSOLE_LOG_END,
    });

    mainFiles.forEach((mainFile) => {
        if (files[mainFile]) {
            // hide integrated theme switcher
            files[mainFile] =
                files[mainFile]
                    ?.replace(/\/\*\* DARK INTEGRATED START \*\*\/([\s\S]*?)\/\*\* DARK INTEGRATED END \*\*\//g, '')
                    .replace(consoleLogRegex, '')
                    .trim() + '\n';

            // Hide the example tear down code use in Documentation tests
            files[mainFile] =
                files[mainFile]
                    ?.replace(/\/\*\* TEAR DOWN START \*\*\/([\s\S]*?)\/\*\* TEAR DOWN END \*\*\//g, '')
                    .trim() + '\n';
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
    internalFramework,
    hideInternalFrameworkSelection,
    supportedFrameworks,
}: {
    id: string;
    isActive?: boolean;
    files: FileContents;
    initialSelectedFile: string;
    internalFramework: InternalFramework;
    hideInternalFrameworkSelection?: boolean;
    supportedFrameworks: InternalFramework[];
}) => {
    const [activeFile, setActiveFile] = useState(initialSelectedFile);
    const [showFiles, setShowFiles] = useState(true);
    const localFiles = { ...files };
    const exampleFiles = Object.keys(localFiles);
    stripOutExampleGeneratorCode(localFiles);

    useEffect(() => {
        setActiveFile(initialSelectedFile);
    }, [initialSelectedFile]);

    return (
        <div
            className={classnames(styles.codeViewer, styles.codeViewerBorder, {
                [styles.hidden]: !isActive,
                [styles.hideFiles]: !showFiles,
            })}
        >
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
                        <CodeOptions
                            id={id}
                            internalFramework={internalFramework}
                            supportedFrameworks={supportedFrameworks}
                        />
                    )}
                </div>
                <div className={styles.code}>
                    {!localFiles && <FileView path={'loading.js'} code={'// Loading...'} />}
                    {localFiles && activeFile && localFiles[activeFile] && (
                        <FileView key={activeFile} path={activeFile} code={localFiles[activeFile]} />
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
