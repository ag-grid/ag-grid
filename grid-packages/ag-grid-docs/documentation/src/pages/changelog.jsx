import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import classnames from 'classnames';
import { Alert } from '../components/alert/Alert';
import ChevronButtonCellRenderer from '../components/grid/ChevronButtonRenderer';
import DetailCellRenderer from '../components/grid/DetailCellRendererComponent';
import Grid from '../components/grid/Grid';
import IssueTypeCellRenderer from '../components/grid/IssueTypeRenderer';
import PaddingCellRenderer from '../components/grid/PaddingCellRenderer';
import ReleaseVersionNotes from '../components/release-notes/ReleaseVersionNotes.jsx';
import styles from './pipelineChangelog.module.scss';

const IS_SSR = typeof window === "undefined"

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
    const [fixVersion, setFixVersion] = useState(extractFixVersionParameter(location));
    const URLFilterItemKey = useState(extractFilterTerm(location))[0];

    const components = useMemo(() => {
        return {
            myDetailCellRenderer: DetailCellRenderer,
            paddingCellRenderer: PaddingCellRenderer,
            chevronButtonCellRenderer: ChevronButtonCellRenderer,
            issueTypeCellRenderer: IssueTypeCellRenderer,
        };
    }, []);

    useEffect(() => {
        fetch('/changelog/changelog.json')
            .then((response) => response.json())
            .then((data) => {
                const gridVersions = [...data.map((row) => row.versions[0])];
                setVersions([...new Set(gridVersions)]);
                setRowData(data);
            });
        fetch('/changelog/releaseVersionNotes.json')
            .then((response) => response.json())
            .then((data) => {
                setAllReleaseNotes(data);
            });
    }, []);

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
            if (releaseNotes) {
                if (releaseNotes['markdown']) {
                    fetch('/changelog/' + releaseNotes['markdown'])
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
            }
            setCurrentReleaseNotes(currentReleaseNotesHtml);
        }
    }, [fixVersion, allReleaseNotes]);

    const gridReady = useCallback((params) => {
        setGridApi(params.api);
        params.api.setQuickFilter(URLFilterItemKey);
        params.api.sizeColumnsToFit();
    }, [URLFilterItemKey]);

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

    const defaultColDef = {
        sortable: true,
        resizable: true,
        cellClass: styles.fontClass,
        headerClass: styles.fontClass,
        autoHeaderHeight: true,
        wrapHeaderText: true,
        suppressMenu: true,
        suppressKeyboardEvent: (params) => {
            if (params.event.key === 'Enter' && params.node.master && params.event.type === 'keydown') {
                params.api
                    .getCellRendererInstances({ rowNodes: [params.node] })
                    [0].clickHandlerFunc();
                return true;
            }
            return false;
        },
        cellDataType: false,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
    };

    const detailCellRendererParams = useCallback(
        (params) => {
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

                            const link = length
                                ? element.substr(element.indexOf('http'), length)
                                : element.substr(element.indexOf('http'));
                            const htmlLink = isEndIndex
                                ? `<a class=${styles.link} href="${link}"
         target="_blank">${link}</a>${element.substr(endIndex)}`
                                : `<a class=${styles.link} target="_blank" href="${link}">${link}</a>`;
                            return element.substr(0, beginningIndex) + htmlLink;
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
        },
        []
    );

    const COLUMN_DEFS = useMemo(
        () => [
            {
                colId: 'key',
                field: 'key',
                headerName: 'Issue',
                width: 150,
                resizable: true,
                cellRendererSelector: (params) => {
                    if (
                        params.node.data.moreInformation ||
                        params.node.data.deprecationNotes ||
                        params.node.data.breakingChangesNotes
                    ) {
                        return {
                            component: 'chevronButtonCellRenderer',
                        };
                    }
                    return {
                        component: 'paddingCellRenderer',
                    };
                },
            },
            {
                field: 'versions',
                headerName: 'Version',
                width: 120,
                resizable: true,
                filter: 'agSetColumnFilter',
            },
            {
                field: 'summary',
                tooltipField: 'summary',
                resizable: true,
                width: 300,
                minWidth: 200,
                flex: 1,
            },
            {
                field: 'issueType',
                valueFormatter: (params) => (params.value === 'Bug' ? 'Defect' : 'Feature Request'),
                filterParams: {
                    valueFormatter: (params) => params.colDef.valueFormatter(params),
                },
                cellRenderer: 'issueTypeCellRenderer',
                width: 175,
                filter: true,
            },
            {
                field: 'status',
                valueGetter: (params) => {
                    return params.data.resolution;
                },
                width: 110,
                filter: true,
            },
            {
                field: 'deprecated',
                headerName: 'Deprecation',
                headerTooltip: 'Deprecation',
                cellDataType: 'boolean',
                valueGetter: (params) => !!params.node.data.deprecationNotes,
                width: 130,
                minWidth: 130,
                filter: true,
            },
            {
                field: 'breakingChange',
                headerTooltip: 'Breaking Change',
                cellDataType: 'boolean',
                valueGetter: (params) => !!params.node.data.breakingChangesNotes,
                width: 105,
                minWidth: 105,
                filter: true,
            },
        ],
        []
    );

    return  (
        <>
            {!IS_SSR && (
            <div className={classnames('page-margin', styles.container)}>
                <h1>AG Grid Changelog</h1>

                <section className={styles.header}>
                    <Alert type="idea">
                        This changelog enables you to identify the specific version in which a feature request or
                        bug fix was included. Check out the {' '}
                        <a href="../pipeline/">Pipeline</a> to see what's in our
                        product backlog.
                    </Alert>

                    <ReleaseVersionNotes
                        releaseNotes={currentReleaseNotes}
                        markdownContent={markdownContent}
                        versions={versions}
                        fixVersion={fixVersion}
                        onChange={switchDisplayedFixVersion}
                    />

                </section>

                <Grid
                    gridHeight={'70.5vh'}
                    columnDefs={COLUMN_DEFS}
                    rowData={rowData}
                    components={components}
                    defaultColDef={defaultColDef}
                    detailRowAutoHeight={true}
                    enableCellTextSelection={true}
                    detailCellRendererParams={detailCellRendererParams}
                    detailCellRenderer={'myDetailCellRenderer'}
                    isRowMaster={isRowMaster}
                    masterDetail
                    onGridReady={gridReady}
                ></Grid>
            </div>
            )}
        </>
    );
};

export default Changelog;
