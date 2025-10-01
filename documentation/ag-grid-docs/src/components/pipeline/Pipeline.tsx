import { Alert } from '@ag-website-shared/components/alert/Alert';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import DetailCellRenderer from '@components/grid/DetailCellRendererComponent';
import { Grid } from '@components/grid/Grid';
import styles from '@pages-styles/pipelineChangelog.module.scss';
import { IssueColDef, IssueTypeColDef } from '@utils/grid/issueColDefs';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import classnames from 'classnames';
import { type ChangeEvent, useCallback, useEffect, useState } from 'react';

const COLUMN_DEFS = [
    IssueColDef,
    {
        field: 'summary',
        tooltipField: 'summary',
        width: 300,
        minWidth: 200,
        flex: 1,
        filter: 'agTextColumnFilter',
    },
    IssueTypeColDef,
    {
        field: 'status',
        width: 135,
        minWidth: 180,
        valueGetter: (params) => {
            const fixVersionsArr = params.data.versions;
            const hasFixVersion = fixVersionsArr.length > 0;
            if (hasFixVersion) {
                const latestFixVersion = fixVersionsArr.length - 1;
                const fixVersion = fixVersionsArr[latestFixVersion];
                if (fixVersion.toUpperCase() === 'NEXT') {
                    return 'Scheduled';
                } else {
                    return `Scheduled for ${fixVersion}`;
                }
            }
            return 'Backlog';
        },
    },
];

const defaultColDef = {
    autoHeight: true,
    filter: true,
    floatingFilter: true,
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

const isRowMaster = (row) => row.moreInformation || row.deprecationNotes || row.breakingChangesNotes;

const newLinesToBreaks = (message) =>
    message.replaceAll('\n\r', '<br>').replaceAll('\n', '<br>').replaceAll('\r', '<br>');

const detailCellRendererParams = (params) => {
    const combinedMessages = [
        params.data.moreInformation,
        params.data.deprecationNotes,
        params.data.breakingChangesNotes,
    ]
        .filter(Boolean)
        .join('\n\n');
    const message = newLinesToBreaks(combinedMessages);
    return {
        message,
    };
};

function useSearchQuery() {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const handleSearchQueryChange = useCallback((event: ChangeEvent<{ value: string }>) => {
        const value = event.target?.value;
        setSearchQuery(value);
    }, []);

    useEffect(() => {
        const searchParams = window.location.search;
        const urlSearchQuery = new URLSearchParams(searchParams).get('searchQuery');
        const value = searchParams && urlSearchQuery ? urlSearchQuery : '';
        setSearchQuery(value);
    }, []);

    return {
        searchQuery,
        handleSearchQueryChange,
    };
}

export const Pipeline = () => {
    const [rowData, setRowData] = useState(null);
    const [gridApi, setGridApi] = useState(null);
    const { searchQuery, handleSearchQueryChange } = useSearchQuery();

    useEffect(() => {
        fetch(urlWithBaseUrl('/pipeline/pipeline.json'))
            .then((response) => response.json())
            .then((data) => {
                setRowData(data);
            });
    }, []);

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

    return (
        <div className={classnames('page-margin', styles.container)}>
            <h1>AG Grid Pipeline</h1>
            <section className={styles.header}>
                <Alert type="idea">
                    <p>
                        The AG Grid pipeline lists the feature requests and active bugs in our product backlog. Use it
                        to see the items scheduled for our next release or to look up the status of a specific item. If
                        you can't find the item you're looking for, check the{' '}
                        <a href={urlWithBaseUrl('/changelog')}>Changelog</a> containing the list of completed items.
                    </p>
                </Alert>
            </section>

            <div className={styles.searchBarOuter}>
                <Icon name="search" />
                <input
                    type="search"
                    className={styles.searchBar}
                    placeholder={'Search pipeline...'}
                    value={searchQuery}
                    onChange={handleSearchQueryChange}
                ></input>
                <span className={classnames(styles.searchExplainer, 'text-secondary')}>
                    Find pipeline items by issue number, summary content
                </span>
            </div>

            <Grid
                gridHeight={'78vh'}
                columnDefs={COLUMN_DEFS}
                isRowMaster={isRowMaster}
                detailRowAutoHeight={true}
                defaultColDef={defaultColDef}
                enableCellTextSelection={true}
                detailCellRendererParams={detailCellRendererParams}
                detailCellRenderer={DetailCellRenderer}
                masterDetail={true}
                loadThemeGoogleFonts={true}
                rowData={rowData}
                onGridReady={gridReady}
            ></Grid>
        </div>
    );
};
