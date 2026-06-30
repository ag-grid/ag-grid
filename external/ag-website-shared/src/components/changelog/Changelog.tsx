import type { Library } from '@ag-grid-types';
import { Alert } from '@ag-website-shared/components/alert/Alert';
import styles from '@ag-website-shared/components/changelog/changelog.module.scss';
import { transformVersion } from '@ag-website-shared/components/changelog/transformVersion';
import { useSearchQuery } from '@ag-website-shared/components/changelog/useSearchQuery';
import DetailCellRenderer from '@ag-website-shared/components/grid/DetailCellRendererComponent';
import { Grid } from '@ag-website-shared/components/grid/Grid';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import { IssueColDef, IssueTypeColDef } from '@ag-website-shared/utils/issueColDefs';
import ReleaseVersionNotes from '@components/release-notes/ReleaseVersionNotes.jsx';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import classnames from 'classnames';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FunctionComponent } from 'react';

interface Props {
    library: Library;
}

const ALL_FIX_VERSIONS = 'All Versions';
const CHANGELOG_DATA_URL = urlWithBaseUrl('/changelog/changelog.json');
const RELEASE_VERSION_NOTES_URL = urlWithBaseUrl('/changelog/releaseVersionNotes.json');

function getChangelogReleaseNotesUrl(pageName: string) {
    return urlWithBaseUrl(`/changelog/${pageName.replace(/^\//, '')}`);
}

function useFixVersion() {
    const [fixVersion, setFixVersion] = useState<string>(ALL_FIX_VERSIONS);

    useEffect(() => {
        const searchParams = window.location.search;
        const fixVersionParam = new URLSearchParams(searchParams).get('fixVersion');
        const version = searchParams && fixVersionParam ? fixVersionParam : undefined;
        setFixVersion(version!);
    }, []);

    return [fixVersion, setFixVersion];
}

const compareSemver = (a: any, b: any) => {
    // versions are in the format 'x.y.z', so we need to compare them as numbers
    const [aMajor, aMinor, aPatch] = a.split('.').map((num: string) => parseInt(num, 10));
    const [bMajor, bMinor, bPatch] = b.split('.').map((num: string) => parseInt(num, 10));

    if (aMajor !== bMajor) {
        return bMajor - aMajor; // Sort by major version descending
    } else if (aMinor !== bMinor) {
        return bMinor - aMinor; // Sort by minor version descending
    } else {
        return bPatch - aPatch;
    }
};

export const Changelog: FunctionComponent<Props> = ({ library }) => {
    const [rowData, setRowData] = useState(null);
    const [gridApi, setGridApi] = useState(null);
    const [versions, setVersions] = useState<string[]>([]);
    const [allReleaseNotes, setAllReleaseNotes] = useState(null);
    const [currentReleaseNotes, setCurrentReleaseNotes] = useState(null);
    const [markdownContent, setMarkdownContent] = useState(undefined);
    const [fixVersion, setFixVersion] = useFixVersion();
    const [hideExpander, setHideExpander] = useState(fixVersion === ALL_FIX_VERSIONS);
    const { searchQuery, handleSearchQueryChange } = useSearchQuery();

    const applyFixVersionFilter = useCallback(() => {
        if (gridApi && fixVersion) {
            const newModel = fixVersion === ALL_FIX_VERSIONS ? null : { values: [fixVersion], filterType: 'set' };
            if (gridApi.getColumnFilterModel('version') === newModel) {
                return;
            }
            gridApi.setColumnFilterModel('version', newModel).then(() => {
                gridApi.onFilterChanged();
            });
        }
    }, [gridApi, fixVersion, versions]);

    useEffect(() => {
        fetch(CHANGELOG_DATA_URL)
            .then((response) => response.json())
            .then((data) => {
                // Extract `version` and transform if needed
                return data.map((row) => {
                    const rowVersion = row.versions[0];
                    const version = library in transformVersion ? transformVersion[library](rowVersion) : rowVersion;
                    return {
                        ...row,
                        version,
                    };
                });
            })
            .then((data) => {
                const dataVersions = [ALL_FIX_VERSIONS, ...data.map((row) => row.version)];
                const allVersions = Array.from(new Set<string>(dataVersions)).sort((v1, v2) => {
                    const [v1Major, v1Minor, v1Patch] = v1.split('.').map((num: string) => parseInt(num, 10));
                    const [v2Major, v2Minor, v2Patch] = v2.split('.').map((num: string) => parseInt(num, 10));

                    if (v1Major !== v2Major) {
                        return v2Major - v1Major;
                    } else if (v1Minor !== v2Minor) {
                        return v2Minor - v1Minor;
                    }

                    return v2Patch - v1Patch;
                });
                setVersions(allVersions);
                setRowData(data);
            });
        fetch(RELEASE_VERSION_NOTES_URL)
            .then((response) => response.json())
            .then((data) => {
                setAllReleaseNotes(data);
            });
    }, [library]);

    useEffect(() => {
        applyFixVersionFilter();
    }, [fixVersion]);

    useEffect(() => {
        let releaseNotesVersion = fixVersion;
        if (!releaseNotesVersion) {
            // Find the latest release notes version
            releaseNotesVersion = allReleaseNotes?.find((element) => !!element['release version'])?.['release version'];
        }

        if (releaseNotesVersion && allReleaseNotes) {
            const releaseNotes = allReleaseNotes.find((element) =>
                element['release version'].includes(releaseNotesVersion)
            );

            let currentReleaseNotesHtml = null;
            let newHideExpander: boolean;
            if (releaseNotes) {
                newHideExpander = !releaseNotes['showExpandLink'] && releaseNotes['markdown'];

                if (releaseNotes['markdown']) {
                    fetch(getChangelogReleaseNotesUrl(releaseNotes['markdown']))
                        .then((response) => response.text())
                        .then((markdownContent) => {
                            setMarkdownContent(markdownContent);
                        })
                        .catch((error) => {
                            console.error('Error fetching Markdown content:', error);
                        });
                } else {
                    currentReleaseNotesHtml = Object.keys(releaseNotes)
                        .map((element) => releaseNotes[element])
                        .join(' ');
                    setMarkdownContent(undefined);
                }
            } else {
                newHideExpander = true;
            }

            setHideExpander(newHideExpander);
            setCurrentReleaseNotes(currentReleaseNotesHtml);
        }
    }, [fixVersion, allReleaseNotes]);

    const gridReady = useCallback(
        (params) => {
            setGridApi(params.api);
        },
        [searchQuery]
    );

    useEffect(() => {
        if (!gridApi) {
            return;
        }

        gridApi.setGridOption('quickFilterText', searchQuery);
    }, [gridApi, searchQuery]);

    const isRowMaster = useCallback((params) => {
        return params.moreInformation || params.deprecationNotes || params.breakingChangesNotes;
    }, []);

    const switchDisplayedFixVersion = useCallback(
        (fixVersion) => {
            setFixVersion(fixVersion);
            const url = new URL(window.location.href);

            // Remove trailing slash when adding search params (SEO)
            if (url.pathname.endsWith('/')) {
                url.pathname = url.pathname.slice(0, -1);
            }

            url.searchParams.set('fixVersion', fixVersion);
            window.history.replaceState({}, '', url);
        },
        [setFixVersion]
    );

    const defaultColDef = useMemo(
        () => ({
            cellClass: styles.fontClass,
            headerClass: styles.fontClass,
            autoHeaderHeight: true,
            wrapHeaderText: true,
            suppressHeaderMenuButton: true,
            filter: true,
            floatingFilter: true,
            suppressKeyboardEvent: (params) => {
                if (params.event.key === 'Enter' && params.node.master && params.event.type === 'keydown') {
                    params.api.getCellRendererInstances({ rowNodes: [params.node] })[0].clickHandlerFunc();
                    return true;
                }
                return false;
            },
            cellDataType: false,
        }),
        []
    );

    const detailCellRendererParams = useCallback((params) => {
        function produceHTML(fieldName, fieldInfo) {
            return fieldName !== 'Link to Documentation'
                ? `<strong>${fieldName}:</strong><br> ${fieldInfo}<br><br>`
                : `<strong>${fieldName}:</strong><br> ${fieldInfo}`;
        }

        const moreInfo = params.data.moreInformation
            ? produceHTML('More Information', params.data.moreInformation)
            : '';
        const deprecationNotes = params.data.deprecationNotes
            ? produceHTML('Deprecation Notes', params.data.deprecationNotes)
            : '';
        const breakingChangesNotes = params.data.breakingChangesNotes
            ? produceHTML('Breaking Changes', params.data.breakingChangesNotes)
            : '';
        const linkToDocumentation = params.data.documentationUrl
            ? produceHTML('Link to Documentation', params.data.documentationUrl)
            : '';

        function makeLinksFunctional(message) {
            let msgArr = message.split(' ');
            const linkStrIdx = msgArr.findIndex((word) => word.includes('https://'));
            if (linkStrIdx > 0) {
                msgArr = msgArr.map((element) => {
                    if (element.includes('https://')) {
                        const beginningIndex = element.indexOf('http');
                        const endIndex = element.indexOf('<', beginningIndex);
                        const isEndIndex = endIndex >= 0;
                        let length = 0;
                        if (isEndIndex) {
                            length = endIndex - beginningIndex;
                        }

                        const httpIdx = element.indexOf('http');
                        const link = length ? element.substring(httpIdx, httpIdx + length) : element.substring(httpIdx);
                        const htmlLink = isEndIndex
                            ? `<a class=${styles.link} href="${link}"
         target="_blank">${link}</a>${element.substring(endIndex)}`
                            : `<a class=${styles.link} target="_blank" href="${link}">${link}</a>`;
                        return element.substring(0, beginningIndex) + htmlLink;
                    }
                    return element;
                });
                message = msgArr.join(' ');
            }
            return message;
        }

        const message = makeLinksFunctional(
            (moreInfo + deprecationNotes + breakingChangesNotes + linkToDocumentation)
                .replaceAll('\n\r', '<br>')
                .replaceAll('\n', '<br>')
                .replaceAll('\r', '<br>')
        );
        return {
            message: message,
        };
    }, []);

    const [filterBreakingChanges, setFilterBreakingChanges] = useState(false);

    const toggleFilterBreakingChanges = () => {
        setFilterBreakingChanges((prev) => !prev);
    };

    const isExternalFilterPresent = useCallback(() => {
        return !!filterBreakingChanges;
    }, [filterBreakingChanges]);

    const doesExternalFilterPass = useCallback(
        (node) => {
            if (filterBreakingChanges && node.data.breakingChangesNotes) {
                return true;
            } else if (filterBreakingChanges) {
                return false;
            }

            return true;
        },
        [filterBreakingChanges]
    );

    const COLUMN_DEFS = useMemo(
        () => [
            IssueColDef,
            {
                field: 'summary',
                tooltipField: 'summary',
                width: 300,
                minWidth: 200,
                filter: 'agTextColumnFilter',
                wrapText: true,
                autoHeight: true,
                flex: 1,
                cellStyle: { lineHeight: '24px', paddingTop: '8px', paddingBottom: '8px' },
            },
            {
                field: 'version',
                headerName: 'Version',
                filter: 'agSetColumnFilter',
                width: 145,
                sort: 'desc',
                filterParams: {
                    comparator: (a, b) => compareSemver(a, b),
                },
                comparator: (a, b) => compareSemver(b, a), // Reverse order for descending
            },
            IssueTypeColDef,
            {
                field: 'status',
                valueGetter: (params) => {
                    return params.data.resolution;
                },
                width: 110,
                resizable: false,
            },
        ],
        []
    );

    return (
        <>
            <section className={styles.header}>
                {library !== 'studio' && (
                    <Alert type="idea">
                        This changelog enables you to identify the specific version in which a feature request or bug
                        fix was included. Check out the <a href={urlWithBaseUrl('/pipeline/')}>Pipeline</a> to see
                        what's in our product backlog.
                    </Alert>
                )}

                <ReleaseVersionNotes
                    releaseNotes={fixVersion === ALL_FIX_VERSIONS ? undefined : currentReleaseNotes}
                    markdownContent={fixVersion === ALL_FIX_VERSIONS ? undefined : markdownContent}
                    versions={versions}
                    fixVersion={fixVersion}
                    onChange={switchDisplayedFixVersion}
                    hideExpander={hideExpander}
                />
            </section>

            <div className={styles.searchBarOuter}>
                <Icon name="search" />
                <input
                    type="search"
                    className={styles.searchBar}
                    placeholder={'Search changelog...'}
                    value={searchQuery}
                    onChange={handleSearchQueryChange}
                ></input>
                <span className={classnames(styles.searchExplainer, 'text-secondary')}>
                    Find by issue number, summary content, or version
                </span>

                <label className={classnames(styles.searchBreakingText, 'text-secondary')}>
                    Breaking changes:
                    <input type="checkbox" checked={filterBreakingChanges} onChange={toggleFilterBreakingChanges} />
                </label>
            </div>

            <Grid
                gridHeight={'70.5vh'}
                columnDefs={COLUMN_DEFS}
                rowData={rowData}
                defaultColDef={defaultColDef}
                detailRowAutoHeight={true}
                enableCellTextSelection={true}
                loadThemeGoogleFonts={true}
                detailCellRendererParams={detailCellRendererParams}
                detailCellRenderer={DetailCellRenderer}
                isRowMaster={isRowMaster}
                masterDetail
                onGridReady={gridReady}
                onFirstDataRendered={() => {
                    applyFixVersionFilter();
                }}
                doesExternalFilterPass={doesExternalFilterPass}
                isExternalFilterPresent={isExternalFilterPresent}
            ></Grid>
        </>
    );
};
