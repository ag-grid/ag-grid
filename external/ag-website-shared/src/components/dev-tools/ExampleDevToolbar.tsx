import type { Framework } from '@ag-grid-types';
import { Select } from '@ag-website-shared/components/select/Select';
import fwLogos from '@ag-website-shared/images/fw-logos';
import { getPageNameFromPath } from '@components/docs/utils/urlPaths';
import { FRAMEWORKS, URL_CONFIG } from '@constants';
import { getFrameworkDisplayText } from '@utils/framework';
import { pathJoin } from '@utils/pathJoin';
import { urlWithPrefix } from '@utils/urlWithPrefix';
import classNames from 'classnames';
import { type FunctionComponent, useCallback, useMemo } from 'react';

import styles from './ExampleDevToolbar.module.scss';

interface Props {
    framework: Framework;
    exampleName: string;
}

export const ExampleDevToolbar: FunctionComponent<Props> = ({ framework, exampleName }) => {
    const { host, pathname } = window.location;
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
            const newUrl =
                pathJoin(
                    window.location.origin,
                    window.location.pathname.replace(`/${framework}-data-grid`, `/${selectedFramework}-data-grid`)
                ) + window.location.hash;
            window.location.replace(newUrl);
        },
        [framework]
    );

    return (
        <div className={styles.exampleLinksContainer}>
            <ul className={`list-style-none ${styles.exampleLinks}`}>
                {Object.entries(URL_CONFIG).map(([env, config]) => {
                    const siteBaseUrl = config.baseUrl ? pathJoin(config.hosts[0], config.baseUrl) : config.hosts[0];
                    const url = pathJoin(
                        'https://',
                        urlWithPrefix({
                            framework,
                            url: `./${pageName}`,
                            siteBaseUrl,
                        }),
                        `#example-${exampleName}`
                    );

                    const isEnv = config.hosts.includes(host);
                    return (
                        <li key={env} className={classNames(styles.exampleLink)}>
                            {isEnv ? <>{env}</> : <a href={url}>{env} </a>}
                        </li>
                    );
                })}
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
