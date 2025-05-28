import type { Framework } from '@ag-grid-types';
import { Select } from '@ag-website-shared/components/select/Select';
import { getDocumentationArchiveUrl, getVersionFromUrl } from '@ag-website-shared/utils/getArchiveUrl';
import { parseVersion } from '@ag-website-shared/utils/parseVersion';
import { LIBRARY } from '@constants';
import { useStore } from '@nanostores/react';
import { $queryClient, defaultQueryOptions } from '@stores/queryClientStore';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { useStoreSsr } from '@utils/hooks/useStoreSsr';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import { urlWithPrefix } from '@utils/urlWithPrefix';
import classNames from 'classnames';
import type { FunctionComponent } from 'react';
import { useCallback, useEffect, useState } from 'react';

import styles from './ExampleDevToolbar.module.scss';
import { $openLinksInNewTab } from './stores/devToolsStore';

interface Props {
    framework: Framework;
    exampleName: string;
    pageName: string;
}

const versionsUrl = urlWithBaseUrl('/debug/versions.json');

export const VersionsSelectorInner: FunctionComponent<Props> = ({ framework, pageName, exampleName }) => {
    const [versions, setVersions] = useState([]);
    const [selectedVersion, setSelectedVersion] = useState<string>();
    const openLinksInNewTab = useStoreSsr($openLinksInNewTab, false);
    const target = openLinksInNewTab ? '_blank' : '_self';

    /**
     * Fetch versions from an endpoint, so it is done only when required, and
     * the versions don't need to be passed down from parent components
     */
    const { data: queryVersions } = useQuery({
        queryKey: ['devTools:versions'],
        queryFn: () => {
            return fetch(versionsUrl)
                .then((res) => res.json())
                .then((json) => {
                    return json;
                });
        },

        ...defaultQueryOptions,
    });

    useEffect(() => {
        if (!queryVersions) {
            return;
        }

        const versionsWithDocs = queryVersions
            .filter((v) => !v.noDocs)
            .map((v) => {
                return {
                    label: v.version,
                    value: v.version,
                };
            });

        setVersions(versionsWithDocs);
    }, [queryVersions]);

    useEffect(() => {
        if (!versions.length) {
            return;
        }

        const versionFromUrl = getVersionFromUrl();
        if (!versionFromUrl) {
            return;
        }
        const version = versions.find((v) => v.value === versionFromUrl);
        setSelectedVersion(version);
    }, [versions]);

    const getKey = useCallback((o) => {
        return o?.value;
    }, []);
    const getGroupLabel = useCallback((o) => {
        const { major, minor } = parseVersion(o.value);

        return `--- v${major}.${minor} ---`;
    }, []);

    const handleVersionsChange = useCallback(
        (newValue) => {
            const version = newValue.value;
            const newUrl = getDocumentationArchiveUrl({
                site: LIBRARY,
                version,
                path:
                    urlWithPrefix({
                        framework,
                        url: `./${pageName}`,
                        siteBaseUrl: '/', // Gets added by `getDocumentationArchiveUrl`
                    }) + `#example-${exampleName}`,
            });

            window.open(newUrl, target);
        },
        [target, framework, pageName, exampleName]
    );

    return versions ? (
        <Select
            isPopper
            placeholder="Archive"
            getKey={getKey}
            getGroupLabel={getGroupLabel}
            options={versions}
            value={selectedVersion}
            onChange={(newValue) => handleVersionsChange(newValue)}
            constrainHeight={true}
            renderItem={(o) => {
                if (!o) {
                    return;
                }

                const { isMajor, versionType } = parseVersion(o.value);
                return (
                    <span
                        className={classNames({
                            [styles.isMajor]: isMajor,
                            [styles.isMinor]: versionType === 'Minor',
                            [styles.isPatch]: versionType === 'Patch',
                        })}
                    >
                        {o.label}
                    </span>
                );
            }}
        />
    ) : null;
};

export const VersionsSelector: FunctionComponent<Props> = (props) => {
    const queryClient = useStore($queryClient);

    return (
        <QueryClientProvider client={queryClient}>
            <VersionsSelectorInner {...props} />
        </QueryClientProvider>
    );
};
