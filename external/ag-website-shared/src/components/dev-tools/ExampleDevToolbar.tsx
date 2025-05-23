import type { Framework } from '@ag-grid-types';
import { VersionsSelector } from '@ag-website-shared/components/dev-tools/VersionsSelector';
import { Select } from '@ag-website-shared/components/select/Select';
import fwLogos from '@ag-website-shared/images/fw-logos';
import { getPageNameFromPath } from '@components/docs/utils/urlPaths';
import { FRAMEWORKS, URL_CONFIG } from '@constants';
import { getFrameworkDisplayText } from '@utils/framework';
import { useStoreSsr } from '@utils/hooks/useStoreSsr';
import { pathJoin } from '@utils/pathJoin';
import { urlWithPrefix } from '@utils/urlWithPrefix';
import classNames from 'classnames';
import { type FunctionComponent, useCallback, useMemo } from 'react';

import styles from './ExampleDevToolbar.module.scss';
import { $openLinksInNewTab } from './stores/devToolsStore';

interface Props {
    framework: Framework;
    exampleName: string;
}

export const ExampleDevToolbar: FunctionComponent<Props> = ({ framework, exampleName }) => {
    const { host, pathname } = window.location;
    const openLinksInNewTab = useStoreSsr($openLinksInNewTab, false);
    const target = openLinksInNewTab ? '_blank' : '_self';
    const pageName = getPageNameFromPath(pathname);
    const frameworkOptions = useMemo(() => {
        return FRAMEWORKS.map((fw) => ({
            label: getFrameworkDisplayText(fw),
            value: fw,
        }));
    }, []);
    const frameworkOption = useMemo(
        () => frameworkOptions.find((o: { value: string }) => o.value === framework) || frameworkOptions[0],
        [frameworkOptions, framework]
    );
    const handleFrameworkChange = useCallback(
        (selectedFramework: Framework) => {
            const newUrl = pathJoin(
                window.location.origin,
                urlWithPrefix({
                    framework: selectedFramework,
                    url: `./${pageName}`,
                }),
                `#example-${exampleName}`
            );

            window.open(newUrl, target);
        },
        [framework, exampleName, pageName, target]
    );

    return (
        <div className={styles.exampleLinksContainer}>
            <ul className={`list-style-none ${styles.exampleLinks}`}>
                {Object.entries(URL_CONFIG).map(([env, config]) => {
                    const siteHostBaseUrl = config.baseUrl
                        ? pathJoin(config.hosts[0], config.baseUrl)
                        : config.hosts[0];
                    const url = pathJoin(
                        `https://${siteHostBaseUrl}`,
                        urlWithPrefix({
                            framework,
                            url: `./${pageName}`,
                        }),
                        `#example-${exampleName}`
                    );

                    const isEnv = config.hosts.includes(host);
                    return (
                        <li key={env} className={classNames(styles.exampleLink)}>
                            {isEnv ? (
                                <>{env}</>
                            ) : (
                                <a href={url} target={target}>
                                    {env}{' '}
                                </a>
                            )}
                        </li>
                    );
                })}
                <VersionsSelector framework={framework} pageName={pageName} exampleName={exampleName} />
                <Select
                    isPopper
                    options={frameworkOptions}
                    value={frameworkOption}
                    onChange={(newValue) => handleFrameworkChange(newValue.value as Framework)}
                    renderItem={(o) => {
                        return (
                            <span className={styles.frameworkItem}>
                                <img src={fwLogos[o.value]} alt={`${o.value} logo`} className={styles.frameworkLogo} />
                                {o.label}
                            </span>
                        );
                    }}
                />
            </ul>
        </div>
    );
};
