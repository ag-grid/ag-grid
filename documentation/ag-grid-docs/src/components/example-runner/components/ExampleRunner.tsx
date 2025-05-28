import type { InternalFramework } from '@ag-grid-types';
import { ExampleDevToolbar } from '@ag-website-shared/components/dev-tools/ExampleDevToolbar';
import { $exampleDevToolbar } from '@ag-website-shared/components/dev-tools/stores/devToolsStore';
import { ExampleLogger } from '@ag-website-shared/components/example-runner/components/ExampleLogger';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import { LinkIcon } from '@ag-website-shared/components/link-icon/LinkIcon';
import { OpenInCTA } from '@ag-website-shared/components/open-in-cta/OpenInCTA';
import type { FileContents } from '@components/example-generator/types';
import { getFrameworkFromInternalFramework } from '@utils/framework';
import { useStoreSsr } from '@utils/hooks/useStoreSsr';
import classnames from 'classnames';
import { type FunctionComponent, type ReactElement, useState } from 'react';

import { CodeViewer } from './CodeViewer';
import { ExampleIFrame } from './ExampleIFrame';
import styles from './ExampleRunner.module.scss';

interface Props {
    id: string;
    title: string;
    exampleName: string;
    exampleUrl?: string;
    exampleRunnerExampleUrl?: string;
    externalLinks?: ReactElement;
    exampleHeight?: number;
    exampleFiles?: FileContents;
    initialSelectedFile?: string;
    internalFramework: InternalFramework;
    hideInternalFrameworkSelection?: boolean;
    loadingIFrameId: string;
    supportedFrameworks: InternalFramework[];
    suppressDarkMode?: boolean;
    hasExampleConsoleLog?: boolean;
    consoleBufferSize?: number;
}

const DEFAULT_HEIGHT = 500;

export const ExampleRunner: FunctionComponent<Props> = ({
    id,
    title,
    exampleName,
    exampleUrl,
    exampleRunnerExampleUrl,
    externalLinks,
    exampleHeight: initialExampleHeight,
    exampleFiles,
    initialSelectedFile,
    internalFramework,
    hideInternalFrameworkSelection,
    loadingIFrameId,
    supportedFrameworks,
    suppressDarkMode,
    hasExampleConsoleLog,
    consoleBufferSize,
}) => {
    const [showCode, setShowCode] = useState(false);
    const showExampleDevToolbar = useStoreSsr($exampleDevToolbar, false);
    const framework = getFrameworkFromInternalFramework(internalFramework);

    const exampleHeight = initialExampleHeight || DEFAULT_HEIGHT;
    return (
        <div className={styles.exampleOuter}>
            <div className={styles.tabsContainer}>
                <div
                    className={classnames(styles.content, {
                        [styles.hasExampleConsoleLog]: hasExampleConsoleLog,
                    })}
                    role="tabpanel"
                    aria-labelledby={`${showCode ? 'Preview' : 'Code'} tab`}
                    style={{ height: exampleHeight, width: '100%' }}
                >
                    <ExampleIFrame
                        title={title}
                        isHidden={showCode}
                        url={exampleRunnerExampleUrl!}
                        loadingIFrameId={loadingIFrameId}
                        suppressDarkMode={suppressDarkMode}
                    />
                    {exampleFiles && (
                        <CodeViewer
                            id={id}
                            isActive={showCode}
                            files={exampleFiles}
                            initialSelectedFile={initialSelectedFile!}
                            internalFramework={internalFramework}
                            hideInternalFrameworkSelection={hideInternalFrameworkSelection}
                            supportedFrameworks={supportedFrameworks}
                        />
                    )}
                </div>
                {hasExampleConsoleLog && <ExampleLogger exampleName={exampleName} bufferSize={consoleBufferSize} />}
                <footer className={styles.footer}>
                    {showExampleDevToolbar && <ExampleDevToolbar framework={framework} exampleName={exampleName} />}
                    <button
                        className={classnames(styles.previewCodeToggle, 'button-secondary')}
                        onClick={() => {
                            setShowCode(!showCode);
                        }}
                    >
                        {showCode && (
                            <span>
                                <Icon name="eye" /> Preview
                            </span>
                        )}
                        {!showCode && (
                            <span>
                                <Icon name="code" /> Code
                            </span>
                        )}
                    </button>

                    <ul className={classnames('list-style-none', styles.externalLinks)}>
                        <li>
                            <LinkIcon href={`#${id}`} exampleLink={true} />
                        </li>
                        <li>
                            <OpenInCTA type="newTab" href={exampleUrl!} />
                        </li>
                        {externalLinks}
                    </ul>
                </footer>
            </div>
        </div>
    );
};
