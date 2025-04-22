import { Icon } from '@ag-website-shared/components/icon/Icon';
import { getExampleContentsUrl, getExampleUrl } from '@components/docs/utils/urlPaths';
import { getFrameworkFromInternalFramework } from '@utils/framework';
import { urlWithPrefix } from '@utils/urlWithPrefix';

import styles from '../DocsExamples.module.scss';

export function LinkCellRenderer({ colDef, data }) {
    if (!data) {
        return;
    }
    const internalFramework = colDef.colId;
    const { pageName, exampleName } = data;
    const titlePrefix = `${pageName} > ${exampleName} > ${internalFramework}`;

    return (
        <div className={styles.linksContainer}>
            <a
                href={urlWithPrefix({
                    framework: getFrameworkFromInternalFramework(internalFramework),
                    url: `./${pageName}#example-${exampleName}`,
                })}
                target="_blank"
                title={`${titlePrefix} example on page`}
            >
                Example
            </a>
            <div>
                <a
                    href={getExampleUrl({
                        internalFramework,
                        pageName,
                        exampleName,
                    })}
                    target="_blank"
                    title={`${titlePrefix} example`}
                >
                    <Icon name="newTab" />
                </a>{' '}
                <a
                    href={getExampleContentsUrl({
                        internalFramework,
                        pageName,
                        exampleName,
                    })}
                    target="_blank"
                    title={`${titlePrefix} contents.json`}
                >
                    <Icon name="codeResult" />
                </a>
            </div>
        </div>
    );
}
