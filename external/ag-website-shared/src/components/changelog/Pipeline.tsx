import type { Library } from '@ag-grid-types';
import { Alert } from '@ag-website-shared/components/alert/Alert';
import styles from '@ag-website-shared/components/changelog/changelog.module.scss';
import { transformVersion } from '@ag-website-shared/components/changelog/transformVersion';
import { useSearchQuery } from '@ag-website-shared/components/changelog/useSearchQuery';
import DetailCellRenderer from '@ag-website-shared/components/grid/DetailCellRendererComponent';
import { Grid } from '@ag-website-shared/components/grid/Grid';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import { IssueColDef, IssueTypeColDef } from '@ag-website-shared/utils/issueColDefs';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import classnames from 'classnames';
import { useCallback, useEffect, useState } from 'react';
import type { FunctionComponent } from 'react';

interface Props {
    library: Library;
}

const PIPELINE_DATA_URL = urlWithBaseUrl('/pipeline/pipeline.json');

const getColDefs = (library: Library) => [
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
                    const version = library in transformVersion ? transformVersion[library](fixVersion) : fixVersion;
                    return `Scheduled for ${version}`;
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

export const Pipeline: FunctionComponent<Props> = ({ library }) => {
    const [COLUMN_DEFS] = useState(getColDefs(library));
    const [rowData, setRowData] = useState(null);
    const [gridApi, setGridApi] = useState(null);
    const { searchQuery, handleSearchQueryChange } = useSearchQuery();
    const libraryTitleCase = library.charAt(0).toUpperCase() + library.slice(1);

    useEffect(() => {
        fetch(PIPELINE_DATA_URL)
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
        <>
            <section className={styles.header}>
                <Alert type="idea">
                    <p>
                        The AG {libraryTitleCase} pipeline lists the feature requests and active bugs in our product
                        backlog. Use it to see the items scheduled for our next release or to look up the status of a
                        specific item. If you can't find the item you're looking for, check the{' '}
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
        </>
    );
};
