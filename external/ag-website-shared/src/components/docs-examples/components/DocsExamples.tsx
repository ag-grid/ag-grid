import { FrameworkLogo } from '@ag-website-shared/components/docs-examples/components/FrameworkLogo';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import { getExampleContentsUrl, getExampleUrl } from '@components/docs/utils/urlPaths';
import { ALL_INTERNAL_FRAMEWORKS } from '@constants';
import { getFrameworkFromInternalFramework } from '@utils/framework';
import { urlWithPrefix } from '@utils/urlWithPrefix';
import type { FunctionComponent } from 'react';

import styles from './DocsExamples.module.scss';

interface Props {
    exampleContents: Record<string, any>;
}

function getFirstAvailableExample(frameworkExamples: any) {
    return Object.values(frameworkExamples).find((example: any) => example);
}

const EnterpriseIcon = () => (
    <span title="Enterprise">
        <Icon name="enterprise" svgClasses={styles.icon} title="enterprise" />
    </span>
);
const ChartsIcon = () => (
    <span title="Integrated Charts">
        <Icon name="chartsColumn" svgClasses={styles.icon} />
    </span>
);
const ConsoleLogIcon = () => (
    <span title="Has console.log">
        <Icon name="terminal" svgClasses={styles.icon} />
    </span>
);

export const DocsExamples: FunctionComponent<Props> = ({ exampleContents }) => {
    return (
        <table>
            <thead>
                <th>No.</th>
                <th>Page</th>
                <th>Example</th>
                <th>Properties</th>
                {ALL_INTERNAL_FRAMEWORKS.map((internalFramework) => {
                    return (
                        <th key={internalFramework}>
                            <FrameworkLogo internalFramework={internalFramework} />
                        </th>
                    );
                })}
            </thead>
            <tbody>
                {Object.values(exampleContents).map((frameworkExamples, index) => {
                    // Since examples are written in typescript, that will be the default (as opposed to javascript)
                    const { pageName, exampleName, isEnterprise, isIntegratedCharts, isLocale, hasExampleConsoleLog } =
                        getFirstAvailableExample(frameworkExamples) || {};
                    return (
                        <tr key={index} className={styles.exampleRow}>
                            <td>{index + 1}</td>
                            <td>{pageName}</td>
                            <td>{exampleName}</td>
                            <td>
                                <span className={styles.propertiesCell}>
                                    {isEnterprise ? <EnterpriseIcon /> : null}
                                    {isIntegratedCharts ? <ChartsIcon /> : null}
                                    {isLocale ? <span title="Has locale">L</span> : null}
                                    {hasExampleConsoleLog ? <ConsoleLogIcon /> : null}
                                </span>
                            </td>
                            {ALL_INTERNAL_FRAMEWORKS.map((internalFramework) => {
                                const titlePrefix = `${pageName} > ${exampleName} > ${internalFramework}`;

                                if (frameworkExamples[internalFramework]) {
                                    return (
                                        <td key={internalFramework}>
                                            <span className={styles.frameworkCell}>
                                                <a
                                                    href={urlWithPrefix({
                                                        framework: getFrameworkFromInternalFramework(internalFramework),
                                                        url: `./${pageName}`,
                                                    })}
                                                    title={`${pageName} ${internalFramework} page`}
                                                >
                                                    <Icon name="pageResult" />
                                                </a>
                                                <a
                                                    href={urlWithPrefix({
                                                        framework: getFrameworkFromInternalFramework(internalFramework),
                                                        url: `./${pageName}#example-${exampleName}`,
                                                    })}
                                                    title={`${titlePrefix} example on page`}
                                                >
                                                    <Icon name="executableProgram" />
                                                </a>
                                                <a
                                                    href={getExampleUrl({
                                                        internalFramework,
                                                        pageName,
                                                        exampleName,
                                                    })}
                                                    title={`${titlePrefix} example`}
                                                >
                                                    <Icon name="newTab" />
                                                </a>
                                                <a
                                                    href={getExampleContentsUrl({
                                                        internalFramework,
                                                        pageName,
                                                        exampleName,
                                                    })}
                                                    title={`${titlePrefix} contents.json`}
                                                >
                                                    <Icon name="codeResult" />
                                                </a>
                                            </span>
                                        </td>
                                    );
                                } else {
                                    return (
                                        <td>
                                            <span title={`No ${internalFramework} example available`}>-</span>
                                        </td>
                                    );
                                }
                            })}
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};
