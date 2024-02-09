import classnames from 'classnames';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from '../components/alert/Alert';
import { useGlobalContext } from '../components/GlobalContext';
import DetailCellRenderer from '../components/grid/DetailCellRendererComponent';
import Grid from '../components/grid/Grid';
import { Icon } from '../components/Icon';
import ReleaseVersionNotes from '../components/release-notes/ReleaseVersionNotes.jsx';
import { hostPrefix } from '../utils/consts';
import { IssueColDef, IssueTypeColDef } from '../utils/grid/issueColDefs';
import styles from '@design-system/modules/pipelineChangelog.module.scss';

const IS_SSR = typeof window === 'undefined';
const ALL_FIX_VERSIONS = 'All Versions';


const Changelog = ({ location }) => {
    const extractFixVersionParameter = (location) => {
        const fixVersionParam = new URLSearchParams(location.search).get('fixVersion');
        return location && location.search && fixVersionParam ? fixVersionParam : undefined;
    };

    const extractFilterTerm = useCallback(
        (location) => (location && location.search ? new URLSearchParams(location.search).get('searchQuery') : ''),
        []
    );

    const [rowData, setRowData] = useState(null);
    const [gridApi, setGridApi] = useState(null);
    const [versions, setVersions] = useState([]);
    const [allReleaseNotes, setAllReleaseNotes] = useState(null);
    const [currentReleaseNotes, setCurrentReleaseNotes] = useState(null);
    const [markdownContent, setMarkdownContent] = useState(undefined);
    const [fixVersion, setFixVersion] = useState(extractFixVersionParameter(location) || ALL_FIX_VERSIONS);
    const [hideExpander, setHideExpander] = useState(fixVersion === ALL_FIX_VERSIONS);
    const URLFilterItemKey = useState(extractFilterTerm(location))[0];
    const searchBarEl = useRef(null);
    const autoSizeStrategy = useMemo(() => ({ type: 'fitGridWidth' }), []);
    const { darkMode } = useGlobalContext();

    const applyFixVersionFilter = useCallback(() => {
        if (gridApi && fixVersion) {
            const newModel = fixVersion === ALL_FIX_VERSIONS ? null : { values: [fixVersion], filterType: 'set' };
            if (gridApi.getColumnFilterModel('version') === newModel) { return; };
            gridApi.setColumnFilterModel('version', newModel).then(() => {
                gridApi.onFilterChanged();
            });
        }
    }, [gridApi, fixVersion, versions]);

    useEffect(() => {
        fetch(`${hostPrefix}/changelog/changelog.json`)
            .then((response) => response.json())
            .then((data) => {
                const gridVersions = [ALL_FIX_VERSIONS, ...data.map((row) => row.versions[0])];
                setVersions([...new Set(gridVersions)]);
                data.forEach((row) => {
                    // Only one version per row
                    row.version = row.versions[0];
                });
                setRowData(data);
            });
        fetch(`${hostPrefix}/changelog/releaseVersionNotes.json`)
            .then((response) => response.json())
            .then((data) => {
                setAllReleaseNotes(data);
            });
    }, []);

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
            let newHideExpander = hideExpander;
            if (releaseNotes) {
                newHideExpander = !releaseNotes['showExpandLink'] && releaseNotes["markdown"];
            
                if (releaseNotes['markdown']) {
                    fetch(`${hostPrefix}/changelog` + releaseNotes['markdown'])
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
            searchBarEl.current.value = URLFilterItemKey;
            params.api.setGridOption('quickFilterText', URLFilterItemKey);
        },
        [URLFilterItemKey]
    );

    const onQuickFilterChange = useCallback(
        (event) => {
            gridApi.setGridOption('quickFilterText', event.target.value);
        },
        [gridApi]
    );

    const isRowMaster = useCallback((params) => {
        return params.moreInformation || params.deprecationNotes || params.breakingChangesNotes;
    }, []);

    const switchDisplayedFixVersion = useCallback(
        (fixVersion) => {
            setFixVersion(fixVersion);
            let url = new URL(window.location);
            url.searchParams.set('fixVersion', fixVersion);
            window.history.pushState({}, '', url);
        },
        [setFixVersion]
    );

    const defaultColDef = useMemo(() => ({
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
    }), []);

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
                        const link = length
                            ? element.substring(httpIdx, httpIdx + length)
                            : element.substring(httpIdx);
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

    const COLUMN_DEFS = useMemo(
        () => [
            IssueColDef,
            {
                field: 'summary',
                tooltipField: 'summary',
                width: 300,
                minWidth: 200,
                flex: 1,
                filter: 'agTextColumnFilter'
            },
            {
                field: 'version',
                headerName: 'Version',
                filter: 'agSetColumnFilter',
                width: 145,                
            },
            IssueTypeColDef,
            {
                field: 'status',
                valueGetter: (params) => {
                    return params.data.resolution;
                },
                width: 110,
                resizable: false
            },
        ],
        []
    );

    return (
        <>
            {!IS_SSR && (
                <div className={classnames('page-margin', styles.container)}>
                    <h1>AG Grid Changelog</h1>

                    <section className={styles.header}>
                        <Alert type="idea">
                            This changelog enables you to identify the specific version in which a feature request or
                            bug fix was included. Check out the <a href="../pipeline/">Pipeline</a> to see what's in our
                            product backlog.
                        </Alert>

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
                            ref={searchBarEl}
                            onChange={onQuickFilterChange}
                        ></input>
                        <span className={classnames(styles.searchExplainer, 'text-secondary')}>
                            Find changelog items by issue number, summary content, or version
                        </span>
                    </div>

                    <Grid
                        gridHeight={'70.5vh'}
                        columnDefs={COLUMN_DEFS}
                        rowData={rowData}
                        defaultColDef={defaultColDef}
                        detailRowAutoHeight={true}
                        enableCellTextSelection={true}
                        detailCellRendererParams={detailCellRendererParams}
                        detailCellRenderer={DetailCellRenderer}
                        isRowMaster={isRowMaster}
                        masterDetail
                        autoSizeStrategy={autoSizeStrategy}
                        onGridReady={gridReady}
                        onFirstDataRendered={() => {
                            applyFixVersionFilter();
                        }}
                        theme={!darkMode ? 'ag-theme-quartz' : 'ag-theme-quartz-dark'}
                    ></Grid>
                </div>
            )}
        </>
    );
};

export default Changelog;
