import classnames from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from '../components/alert/Alert';
import GlobalContextConsumer from '../components/GlobalContext';
import ChevronButtonCellRenderer from '../components/grid/ChevronButtonRenderer';
import DetailCellRenderer from '../components/grid/DetailCellRendererComponent';
import Grid from '../components/grid/Grid';
import IssueTypeCellRenderer from '../components/grid/IssueTypeRenderer';
import PaddingCellRenderer from '../components/grid/PaddingCellRenderer';
import { Icon } from '../components/Icon';
import styles from './pipelineChangelog.module.scss';

const COLUMN_DEFS = [
    {
        field: 'key',
        headerName: 'Issue',
        width: 140,
        cellRendererSelector: (params) => {
            if (
                params.node.data.moreInformation ||
                params.node.data.deprecationNotes ||
                params.node.data.breakingChangesNotes
            ) {
                return {
                    component: 'chevronButtonRenderer',
                };
            }
            return {
                component: 'paddingCellRenderer',
            };
        },
    },
    {
        field: 'summary',
        tooltipField: 'summary',
        width: 300,
        minWidth: 200,
        flex: 1,
    },
    {
        field: 'issueType',
        width: 180,
        valueFormatter: (params) => (params.value === 'Bug' ? 'Defect' : 'Feature Request'),
        cellRenderer: 'issueTypeCellRenderer',
    },
    {
        field: 'status',
        width: 135,
        valueGetter: (params) => {
            let fixVersionsArr = params.data.versions;
            let hasFixVersion = fixVersionsArr.length > 0;
            if (hasFixVersion) {
                let latestFixVersion = fixVersionsArr.length - 1;
                let fixVersion = fixVersionsArr[latestFixVersion];
                if (fixVersion === 'Next' && (params.data.status === 'Backlog' || params.data.status === 'Done')) {
                    return 'Next Release';
                }
            }
            if (params.data.status === 'Done' && params.data.resolution !== 'Done') {
                return params.data.resolution;
            }

            if (params.data.status !== 'Done' && params.data.status !== 'Backlog') {
                return 'Scheduled';
            } else {
                return 'Backlog';
            }
        },
    },
];

const defaultColDef = {
    resizable: true,
    sortable: true,
    suppressMenu: true,
    autoHeight: true,
    cellClass: styles.fontClass,
    headerClass: styles.fontClass,
    suppressKeyboardEvent: (params) => {
        if (params.event.key === 'Enter' && params.node.master && params.event.type === 'keydown') {
            params.api.getCellRendererInstances({ rowNodes: [params.node] })[0].clickHandlerFunc();
            return true;
        }
        return false;
    },
    cellDataType: false,
};

const IS_SSR = typeof window === 'undefined';

const isRowMaster = (row) => row.moreInformation;

const detailCellRendererParams = (params) => {
    let message = params.data.moreInformation;
    message = message.replaceAll('\n\r', '<br>');
    message = message.replaceAll('\n', '<br>');
    message = message.replaceAll('\r', '<br>');

    function makeLinksFunctional(message) {
        let msgArr = message.split(' ');
        let linkStrIdx = msgArr.findIndex((word) => word.includes('https://'));
        if (linkStrIdx > 0) {
            msgArr = msgArr.map((element) => {
                if (element.includes('https://')) {
                    let beginningIndex = element.indexOf('http');
                    let endIndex = element.indexOf('<', beginningIndex);
                    let isEndIndex = endIndex >= 0;
                    let length = 0;
                    if (isEndIndex) {
                        length = endIndex - beginningIndex;
                    }

                    let link = length
                        ? element.substr(element.indexOf('http'), length)
                        : element.substr(element.indexOf('http'));
                    let htmlLink = isEndIndex
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

    message = makeLinksFunctional(message);
    let res = {};
    res.message = message;

    return res;
};

const extractFilterTerm = (location) =>
    location && location.search ? new URLSearchParams(location.search).get('searchQuery') : '';

const Pipeline = ({ location }) => {
    const [rowData, setRowData] = useState(null);
    const [gridApi, setGridApi] = useState(null);
    const URLFilterSearchQuery = useState(extractFilterTerm(location))[0];
    const searchBarEl = useRef(null);

    useEffect(() => {
        fetch('/pipeline/pipeline.json')
            .then((response) => response.json())
            .then((data) => {
                setRowData(data);
            });
    }, []);

    const gridReady = (params) => {
        setGridApi(params.api);
        params.api.setQuickFilter(URLFilterSearchQuery);
    };

    const onQuickFilterChange = useCallback(
        (event) => {
            gridApi.setQuickFilter(event.target.value);
        },
        [gridApi]
    );

    return (
        <>
            {!IS_SSR && (
                <div className={classnames('page-margin', styles.container)}>
                    <h1>AG Grid Pipeline</h1>
                    <section className={styles.header}>
                        <Alert type="idea">
                            <p>
                                The AG Grid pipeline lists the feature requests and active bugs in our product backlog.
                                Use it to see the items scheduled for our next release or to look up the status of a
                                specific item. If you can’t find the item you’re looking for, check the{' '}
                                <a href="../changelog/">Changelog</a> containing the list of completed items.
                            </p>
                        </Alert>
                    </section>

                    <div className={styles.searchBarOuter}>
                        <Icon name="search" />
                        <input
                            type="search"
                            className={styles.searchBar}
                            placeholder={'Search pipeline...'}
                            ref={searchBarEl}
                            onChange={onQuickFilterChange}
                        ></input>
                        <span className={classnames(styles.searchExplainer, 'text-secondary')}>
                            Find pipeline items by issue number, summary content, or version
                        </span>
                    </div>

                    <GlobalContextConsumer>
                        {({ darkMode }) => {
                            return (
                                <Grid
                                    gridHeight={'78vh'}
                                    columnDefs={COLUMN_DEFS}
                                    isRowMaster={isRowMaster}
                                    detailRowAutoHeight={true}
                                    components={{
                                        myDetailCellRenderer: DetailCellRenderer,
                                        paddingCellRenderer: PaddingCellRenderer,
                                        chevronButtonRenderer: ChevronButtonCellRenderer,
                                        issueTypeCellRenderer: IssueTypeCellRenderer,
                                    }}
                                    defaultColDef={defaultColDef}
                                    enableCellTextSelection={true}
                                    detailCellRendererParams={detailCellRendererParams}
                                    detailCellRenderer={'myDetailCellRenderer'}
                                    masterDetail={true}
                                    rowData={rowData}
                                    onGridReady={gridReady}
                                    theme={darkMode ? 'ag-theme-alpine-blue' : 'ag-theme-alpine'}
                                ></Grid>
                            );
                        }}
                    </GlobalContextConsumer>
                </div>
            )}
        </>
    );
};

export default Pipeline;
