import type { Framework } from '@ag-grid-types';
import { Select } from '@ag-website-shared/components/select/Select';
import { getDocumentationArchiveUrl } from '@ag-website-shared/utils/getArchiveUrl';
import { parseVersion } from '@ag-website-shared/utils/parseVersion';
import { LIBRARY } from '@constants';
import { useStore } from '@nanostores/react';
import { $queryClient, defaultQueryOptions } from '@stores/queryClientStore';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { pathJoin } from '@utils/pathJoin';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import { urlWithPrefix } from '@utils/urlWithPrefix';
import classNames from 'classnames';
import type { FunctionComponent } from 'react';
import { useCallback, useEffect, useState } from 'react';

import styles from './ExampleDevToolbar.module.scss';

interface Props {
    framework: Framework;
    exampleName: string;
    pageName: string;
}

const versionsUrl = urlWithBaseUrl('/debug/versions.json');

export const VersionsSelectorInner: FunctionComponent<Props> = ({ framework, pageName, exampleName }) => {
    const [versions, setVersions] = useState([]);

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
    const getKey = useCallback((o) => {
        return o?.value;
    }, []);
    const getGroupLabel = useCallback((o) => {
        const { major, minor } = parseVersion(o.value);

        return `--- v${major}.${minor} ---`;
    }, []);

    const handleVersionsChange = useCallback((newValue) => {
        const version = newValue.value;
        const newUrl = getDocumentationArchiveUrl({
            site: LIBRARY,
            version,
            path:
                urlWithPrefix({
                    framework,
                    url: `./${pageName}`,
                }) + `#example-${exampleName}`,
        });

        window.location.href = newUrl;
    }, []);

    return versions ? (
        <Select
            isPopper
            placeholder="Archive"
            getKey={getKey}
            getGroupLabel={getGroupLabel}
            options={versions}
            value={undefined}
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
