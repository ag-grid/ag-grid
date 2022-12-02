import React, { useEffect, useRef, useState } from 'react';
import ChevronButtonCellRenderer from '../grid/ChevronButtonRenderer';
import DetailCellRenderer from '../grid/DetailCellRendererComponent';
import Grid from '../grid/Grid';
import IssueTypeCellRenderer from '../grid/IssueTypeRenderer';
import PaddingCellRenderer from '../grid/PaddingCellRenderer';
import styles from './Pipeline.module.scss';

const COLUMN_DEFS = [
    {
        field: 'key',
        headerName: 'Issue',
        width: 140,
        filter: false,
        headerClass: styles['header-padding-class'],
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
        flex: 1,
        filter: false,
    },
    {
        field: 'issueType',
        width: 180,
        valueFormatter: (params) => (params.value === 'Bug' ? 'Defect' : 'Feature Request'),
        filterParams: {
            valueFormatter: (params) => {
                return params.colDef.valueFormatter(params);
            },
        },
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
    {
        field: 'features',
        headerName: 'Feature',
        width: 195,
        valueFormatter: (params) => {
            let isValue = !!params.value;
            return isValue ? params.value.toString().replaceAll('_', ' ') : undefined;
        },
        tooltipValueGetter: (params) => {
            return params.colDef.valueFormatter(params);
        },
        filterParams: {
            valueFormatter: (params) => {
                return params.colDef.valueFormatter(params);
            },
        },
    },
];

const defaultColDef = {
    resizable: true,
    filter: true,
    sortable: true,
    cellClass: styles['font-class'],
    headerClass: styles['font-class'],
    suppressMenu: true,
    autoHeight: true,
    suppressKeyboardEvent: (params) => {
        if (params.event.key === 'Enter' && params.node.master && params.event.type === 'keydown') {
            params.api.getCellRendererInstances({ rowNodes: [params.node] })[0].clickHandlerFunc();
            return true;
        }
        return false;
    },
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
                        ? `<a class=${styles['anchor-tag-class']} href="${link}"
          target="_blank">${link}</a>${element.substr(endIndex)}`
                        : `<a class=${styles['anchor-tag-class']} target="_blank" href="${link}">${link}</a>`;
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
    const searchBarEl = useRef(null);
    const URLFilterSearchQuery = useState(extractFilterTerm(location))[0];

    useEffect(() => {
        fetch('/pipeline/pipeline.json')
            .then((response) => response.json())
            .then((data) => {
                setRowData(data);
            });
    }, []);

    const gridReady = (params) => {
        setGridApi(params.api);
        searchBarEl.current.value = URLFilterSearchQuery;
        params.api.setQuickFilter(URLFilterSearchQuery);
    };

    const onQuickFilterChange = (event) => {
        gridApi.setQuickFilter(event.target.value);
    };

    const onCheckboxChange = (event, filterTerm) => {
        function setTheFilter(column, filterValue, shouldFilter) {
            const filterInstance = gridApi.getFilterInstance(column);
            const currentFilterModel = filterInstance.getModel();
            const isCurrentFilterModel = !!currentFilterModel;
            let newValues = undefined;

            if (!shouldFilter && !isCurrentFilterModel) {
                newValues = [...filterInstance.getValues()];
                newValues.splice(newValues.indexOf(filterValue), 1);
            } else if (!shouldFilter && isCurrentFilterModel) {
                newValues = [...currentFilterModel.values];
                const filterIdx = newValues.indexOf(filterValue);
                if (filterIdx > -1) newValues.splice(filterIdx, 1);
            } else if (shouldFilter && isCurrentFilterModel) {
                newValues = [...currentFilterModel.values];
                newValues.push(filterValue);
            } else {
                return;
            }
            const newModel = { values: newValues, filterType: 'set' };
            filterInstance.setModel(newModel);
            gridApi.onFilterChanged();
        }

        switch (filterTerm) {
            case 'defect':
                setTheFilter('issueType', 'Bug', event.target.checked);
                break;
            case 'featureRequest':
                setTheFilter('issueType', 'Task', event.target.checked);
                break;
            case 'nextRelease':
                setTheFilter('status', 'Backlog', !event.target.checked);
                break;
            default:
                break;
        }
    };

    const checkboxes = [
        { id: 'featureRequest', label: 'Feature Requests', checked: true },
        { id: 'defect', label: 'Defects', checked: true },
        { id: 'nextRelease', label: 'Next Release', checked: false },
    ];

    const createLabeledCheckbox = (checkboxConfig) => {
        const { id, label, checked } = checkboxConfig;
        const key = `${id}-checkbox`;
        return (
            <div className={styles['single-checkbox-label-container']} key={key}>
                <label className={styles['label-for-checkboxes']}>
                    <input
                        id={key}
                        type="checkbox"
                        className={styles['checkbox-class']}
                        defaultChecked={checked}
                        onChange={(event) => onCheckboxChange(event, id)}
                    ></input>
                    {label}
                </label>
            </div>
        );
    };

    return (
        <>
            {!IS_SSR && (
                <div
                    style={{
                        height: '100%',
                        width: '99%%',
                        marginLeft: '5rem',
                        marginRight: '5rem',
                        paddingBottom: '5rem',
                    }}
                >
                    <div
                        style={{
                            fontWeight: 400,
                            fontSize: '2.5rem',
                            lineHeight: 1.2,
                            marginTop: '20px',
                            marginBottom: '20px',
                        }}
                    >
                        AG Grid Pipeline
                    </div>
                    <div className={styles['note']}>
                        <p>
                            The AG Grid pipeline lists the feature requests and active bugs in our product backlog. Use
                            it to see the items scheduled for our next release or to look up the status of a specific
                            item. If you can’t find the item you’re looking for, check the{' '}
                            <a href="https://www.ag-grid.com/ag-grid-changelog/">Changelog</a> containing the list of
                            completed items.
                        </p>
                    </div>
                    <div className={styles['global-search-filter-container']}>
                        <div className={styles['search-bar-container']}>
                            <input
                                type="text"
                                placeholder={'Search pipeline…'}
                                className={styles['search-bar']}
                                ref={searchBarEl}
                                onChange={onQuickFilterChange}
                            ></input>
                        </div>
                        <div className={styles['all-checkboxes-container']}>
                            {checkboxes.map((checkboxConfig) => createLabeledCheckbox(checkboxConfig))}
                        </div>
                    </div>

                    <Grid
                        gridHeight={'63vh'}
                        columnDefs={COLUMN_DEFS}
                        isRowMaster={isRowMaster}
                        detailRowAutoHeight={true}
                        components={{
                            myDetailCellRenderer: DetailCellRenderer,
                            paddingCellRenderer: PaddingCellRenderer,
                            chevronButtonRenderer: ChevronButtonCellRenderer,
                            issueTypeCellRenderer: IssueTypeCellRenderer,
                        }}
                        suppressReactUi={true}
                        defaultColDef={defaultColDef}
                        reactUi={false}
                        enableCellTextSelection={true}
                        detailCellRendererParams={detailCellRendererParams}
                        detailCellRenderer={'myDetailCellRenderer'}
                        masterDetail={true}
                        rowData={rowData}
                        onGridReady={gridReady}
                    ></Grid>
                </div>
            )}
        </>
    );
};

export default Pipeline;
