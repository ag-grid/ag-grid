import type { ImportType, InternalFramework } from '@ag-grid-types';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import { OpenInCTA } from '@ag-website-shared/components/open-in-cta/OpenInCTA';
import type { FileContents } from '@features/example-generator/types';
import styles from '@legacy-design-system/modules/ExampleRunner.module.scss';
import classnames from 'classnames';
import { type FunctionComponent, type ReactElement, useState } from 'react';

import { CodeViewer } from './CodeViewer';
import { ExampleIFrame } from './ExampleIFrame';

interface Props {
    id: string;
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
    supportedImportTypes: ImportType[];
}

const DEFAULT_HEIGHT = 500;

export const ExampleRunner: FunctionComponent<Props> = ({
    id,
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
    supportedImportTypes,
}) => {
    const [showCode, setShowCode] = useState(false);

    const exampleHeight = initialExampleHeight || DEFAULT_HEIGHT;
    return (
        <div id={id} className={styles.exampleOuter}>
            <div className={styles.tabsContainer}>
                <div
                    className={styles.content}
                    role="tabpanel"
                    aria-labelledby={`${showCode ? 'Preview' : 'Code'} tab`}
                    style={{ height: exampleHeight, width: '100%' }}
                >
                    <ExampleIFrame
                        isHidden={showCode}
                        url={exampleRunnerExampleUrl!}
                        loadingIFrameId={loadingIFrameId}
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
                            supportedImportTypes={supportedImportTypes}
                        />
                    )}
                </div>
                <footer className={styles.footer}>
                    <button
                        className={classnames(styles.previewCodeToggle, 'button-secondary')}
                        onClick={(e) => {
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
                            <OpenInCTA type="newTab" href={exampleUrl!} />
                        </li>
                        {externalLinks}
                    </ul>
                </footer>
            </div>
        </div>
    );
};
