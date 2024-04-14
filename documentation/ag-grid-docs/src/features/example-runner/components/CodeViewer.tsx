import type { ImportType, InternalFramework } from '@ag-grid-types';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import Code from '@components/Code';
import type { FileContents } from '@features/example-generator/types';
import styles from '@legacy-design-system/modules/CodeViewer.module.scss';
import { doOnEnter } from '@utils/doOnEnter';
import classnames from 'classnames';
import { useEffect, useState } from 'react';

import { POST_INIT_MESSAGE_END, POST_INIT_MESSAGE_START } from '../constants';
import { CodeOptions } from './CodeOptions';

export const DARK_MODE_START = '/** DARK MODE START **/';
export const DARK_MODE_END = '/** DARK MODE END **/';

const ExtensionMap = {
    sh: 'bash',
    vue: 'html',
    tsx: 'jsx',
    json: 'js',
};

export function stripOutDarkModeCode(files: FileContents) {
    const mainFiles = ['main.js', 'main.ts', 'index.tsx', 'index.jsx', 'app.component.ts'];
    const defaultTheme =
        document.documentElement.dataset.darkMode?.toUpperCase() === 'TRUE'
            ? 'ag-theme-quartz-dark'
            : 'ag-theme-quartz';
    mainFiles.forEach((mainFile) => {
        if (files[mainFile]) {
            // Integrated charts examples can only be viewed in light mode so that chart and grid match
            const useDefaultTheme = !files[mainFile]?.includes('DARK INTEGRATED START');

            // Hide theme switcher
            files[mainFile] = files[mainFile]?.replace(
                /\/\*\* DARK MODE START \*\*\/([\s\S]*?)\/\*\* DARK MODE END \*\*\//g,
                `"${useDefaultTheme ? defaultTheme : 'ag-theme-quartz'}"`
            );

            // hide integrated theme switcher
            files[mainFile] = files[mainFile]?.replace(
                /\/\*\* DARK INTEGRATED START \*\*\/([\s\S]*?)\/\*\* DARK INTEGRATED END \*\*\//g,
                ''
            );
        }
    });
    /* RTI-1751 Would break JS master detail example that provides a grid too,
   if (files['index.html']) {        
        files['index.html'] = files['index.html']?.replace(/(['"\s])ag-theme-quartz(['"\s])/g, "$1" + defaultTheme + "$2");
    } */
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
    supportedImportTypes,
}: {
    id: string;
    isActive?: boolean;
    files: FileContents;
    initialSelectedFile: string;
    internalFramework: InternalFramework;
    hideInternalFrameworkSelection?: boolean;
    supportedFrameworks: InternalFramework[];
    supportedImportTypes: ImportType[];
}) => {
    const [activeFile, setActiveFile] = useState(initialSelectedFile);
    const [showFiles, setShowFiles] = useState(true);
    let localFiles = { ...files };
    const exampleFiles = Object.keys(localFiles);
    stripOutDarkModeCode(localFiles);

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
                            supportedImportTypes={supportedImportTypes}
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
