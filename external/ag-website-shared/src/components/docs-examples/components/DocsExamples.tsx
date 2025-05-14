import type { InternalFramework, Library } from '@ag-grid-types';
import { INTERNAL_FRAMEWORKS } from '@constants';
import { type FunctionComponent, useCallback, useRef } from 'react';
import { useMemo, useState } from 'react';

import { AllCommunityModule } from 'ag-grid-community';
import type { ColDef, ColGroupDef, ColumnState, ColumnVisibleEvent, GridReadyEvent } from 'ag-grid-community';
import {
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    SetFilterModule,
    SideBarModule,
    StatusBarModule,
} from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

import styles from './DocsExamples.module.scss';
import { ChartsHeaderComponent } from './cell-renderers/ChartsHeaderComponent';
import { EnterpriseCellRenderer } from './cell-renderers/EnterpriseCellRenderer';
import { EnterpriseHeaderComponent } from './cell-renderers/EnterpriseHeaderComponent';
import { ExampleCountComponent } from './cell-renderers/ExampleCountComponent';
import { ExampleNameCellRenderer } from './cell-renderers/ExampleNameCellRenderer';
import { FrameworkLogoCellRenderer } from './cell-renderers/FrameworkLogoCellRenderer';
import { LinkCellRenderer } from './cell-renderers/LinkCellRenderer';
import { PageCountComponent } from './cell-renderers/PageCountComponent';

export type ExampleProperty =
    | 'sourceFileList'
    | 'isEnterprise'
    | 'isIntegratedCharts'
    | 'isLocale'
    | 'hasExampleConsoleLog';

export interface Props {
    library: Library;
    properties?: ExampleProperty[];
    exampleContents: any[];
}
type Environment = 'local' | 'staging' | 'production';

const LOCALSTORAGE_PREFIX = 'documentation:debug';
const LOCALSTORAGE_COL_STATE_KEY = `${LOCALSTORAGE_PREFIX}:colState`;

const URL_MAPPING: Record<
    Library,
    Record<Environment, ({ pageName, exampleName }: { pageName: string; exampleName: string }) => string>
> = {
    grid: {
        local: ({ pageName, exampleName }) =>
            `https://localhost:4610/javascript-data-grid/${pageName}/#example-${exampleName}`,
        staging: ({ pageName, exampleName }) =>
            `https://grid-staging.ag-grid.com/javascript-data-grid/${pageName}/#example-${exampleName}`,
        production: ({ pageName, exampleName }) =>
            `https://www.ag-grid.com/javascript-data-grid/${pageName}/#example-${exampleName}`,
    },
    charts: {
        local: ({ pageName, exampleName }) =>
            `https://localhost:4600/charts/javascript/${pageName}/#example-${exampleName}`,
        staging: ({ pageName, exampleName }) =>
            `https://charts-staging.ag-grid.com/javascript/${pageName}/#example-${exampleName}`,
        production: ({ pageName, exampleName }) =>
            `https://www.ag-grid.com/charts/javascript/${pageName}/#example-${exampleName}`,
    },
};

const ALL_PROPERTIES: (ColDef & {
    field: ExampleProperty;
})[] = [
    {
        field: 'sourceFileList',
        headerName: 'Source Files',
        minWidth: 200,
        filter: 'agSetColumnFilter',
        valueFormatter: ({ value }) => {
            if (!value) {
                return '';
            }

            return Array.isArray(value) ? value.join(', ') : value;
        },
    },
    {
        field: 'isEnterprise',
        headerName: 'Enterprise',
        headerComponentParams: {
            innerHeaderComponent: EnterpriseHeaderComponent,
        },
        enableRowGroup: true,
        minWidth: 80,
        cellRenderer: EnterpriseCellRenderer,
    },
    {
        field: 'isIntegratedCharts',
        headerName: 'Charts',
        headerComponentParams: {
            innerHeaderComponent: ChartsHeaderComponent,
        },
        enableRowGroup: true,
        minWidth: 80,
    },
    {
        field: 'isLocale',
        headerName: 'Locale',
        enableRowGroup: true,
        minWidth: 110,
    },
    {
        field: 'hasExampleConsoleLog',
        headerName: 'Log',
        enableRowGroup: true,
        minWidth: 90,
    },
];

export const DocsExamples: FunctionComponent<Props> = ({ library, properties = [], exampleContents }) => {
    const gridRef = useRef<AgGridReact>(null);
    const [colDefs] = useState<(ColDef | ColGroupDef)[]>([
        {
            field: 'pageName',
            rowGroup: true,
            hide: true,
            enableRowGroup: true,
        },
        {
            field: 'exampleName',
            hide: true,
        },
        ...ALL_PROPERTIES.filter((property) => properties.includes(property.field)),

        {
            headerName: 'React',
            headerGroupComponentParams: {
                innerHeaderGroupComponent: FrameworkLogoCellRenderer,
                innerHeaderGroupComponentParams: {
                    framework: 'react',
                },
            },
            children: [
                {
                    colId: 'reactFunctional' as InternalFramework,
                    headerName: 'React',
                    cellRenderer: LinkCellRenderer,
                    filter: false,
                    minWidth: 200,
                },
                {
                    colId: 'reactFunctionalTs' as InternalFramework,
                    headerName: 'React TS',
                    cellRenderer: LinkCellRenderer,
                    filter: false,
                    minWidth: 200,
                },
            ],
        },
        {
            colId: 'angular' as InternalFramework,
            headerName: 'Angular',
            headerComponentParams: {
                innerHeaderComponent: FrameworkLogoCellRenderer,
                innerHeaderComponentParams: {
                    framework: 'angular',
                },
            },
            cellRenderer: LinkCellRenderer,
            filter: false,
            minWidth: 200,
        },
        {
            colId: 'vue3' as InternalFramework,
            headerName: 'Vue',
            headerComponentParams: {
                innerHeaderComponent: FrameworkLogoCellRenderer,
                innerHeaderComponentParams: {
                    framework: 'vue',
                },
            },
            cellRenderer: LinkCellRenderer,
            filter: false,
            minWidth: 200,
        },
        {
            headerName: 'JavaScript',
            headerGroupComponentParams: {
                innerHeaderGroupComponent: FrameworkLogoCellRenderer,
                innerHeaderGroupComponentParams: {
                    framework: 'javascript',
                },
            },
            children: [
                {
                    colId: 'vanilla' as InternalFramework,
                    headerName: 'Vanilla JS',
                    cellRenderer: LinkCellRenderer,
                    filter: false,
                    minWidth: 200,
                },
                {
                    colId: 'typescript' as InternalFramework,
                    headerName: 'Typescript',
                    cellRenderer: LinkCellRenderer,
                    filter: false,
                    minWidth: 200,
                },
            ],
        },
    ]);
    const [colState, setColState] = useState<ColumnState[]>();
    const [columnsVisible, setColumnsVisible] = useState<Record<InternalFramework, boolean>>({
        vanilla: false,
        typescript: false,
        reactFunctional: false,
        reactFunctionalTs: false,
        angular: false,
        vue3: false,
    });

    const defaultColDef: ColDef = {
        flex: 1,
        minWidth: 100,
        filter: true,
    };
    const autoGroupColumnDef = useMemo<ColDef>(() => {
        return {
            headerName: 'Page Examples',
            field: 'exampleName',
            cellRendererParams: {
                suppressPadding: true,
                innerRenderer: ExampleNameCellRenderer,
                innerRendererParams: {
                    columnsVisible,
                    properties,
                },
            },
            minWidth: 400,
            pinned: 'left',
        };
    }, [columnsVisible, properties]);
    const rowGroupPanelShow = 'always';
    const groupDisplayType = 'singleColumn';
    const groupDefaultExpanded = 1;
    const sideBar = useMemo(() => {
        return {
            toolPanels: ['filters', 'columns'],
        };
    }, []);

    const [statusBar] = useState({
        statusPanels: [
            {
                statusPanel: PageCountComponent,
            },
            {
                statusPanel: ExampleCountComponent,
            },
        ],
    });

    const onColumnVisible = useCallback(({ api }: ColumnVisibleEvent | GridReadyEvent) => {
        const newColumnsVisible = {} as Record<InternalFramework, boolean>;
        INTERNAL_FRAMEWORKS.forEach((internalFramework: InternalFramework) => {
            newColumnsVisible[internalFramework] = Boolean(api.getColumn(internalFramework)?.isVisible());
        });

        setColumnsVisible(newColumnsVisible);
    }, []);

    const applyLocalStorageColState = useCallback(() => {
        const localColState = localStorage.getItem(LOCALSTORAGE_COL_STATE_KEY);

        if (!localColState) {
            return;
        }

        const parsedColState = JSON.parse(localColState) as ColumnState[];
        setColState(parsedColState);
        gridRef.current!.api.applyColumnState({
            state: parsedColState,
            applyOrder: true,
        });
    }, [gridRef]);
    const onGridReady = useCallback((event: GridReadyEvent) => {
        onColumnVisible(event);
        applyLocalStorageColState();
    }, []);

    const onFilterTextBoxChanged = useCallback(() => {
        gridRef.current!.api.setGridOption(
            'quickFilterText',
            (document.getElementById('filter-text-box') as HTMLInputElement).value
        );
    }, [gridRef]);

    const copyFilteredRows = useCallback(() => {
        const rows = [
            [
                'Page Name',
                'Example Name',
                'Source Files',
                'Enterprise',
                'Integrated Charts',
                'Locale',
                'Console Log',
                'Local URL',
                'Staging URL',
                'Production URL',
            ],
        ];
        gridRef.current!.api.forEachNodeAfterFilterAndSort((node) => {
            if (node.group) {
                return;
            }

            const {
                pageName,
                exampleName,
                sourceFileList,
                isEnterprise,
                isIntegratedCharts,
                isLocale,
                hasExampleConsoleLog,
            } = node.data;
            const localUrl = URL_MAPPING[library].local({ pageName, exampleName });
            const stagingUrl = URL_MAPPING[library].staging({ pageName, exampleName });
            const productionUrl = URL_MAPPING[library].production({ pageName, exampleName });
            const row = [
                pageName,
                exampleName,
                sourceFileList?.join(', '),
                isEnterprise,
                isIntegratedCharts,
                isLocale,
                hasExampleConsoleLog,
                localUrl,
                stagingUrl,
                productionUrl,
            ];
            rows.push(row);
        });

        const rowsText = rows.map((row) => row.join('\t')).join('\n');
        navigator.clipboard.writeText(rowsText);
    }, [gridRef]);

    const saveState = useCallback(() => {
        const currentColState = gridRef.current!.api.getColumnState();
        setColState(currentColState);

        localStorage.setItem(LOCALSTORAGE_COL_STATE_KEY, JSON.stringify(currentColState));
    }, [gridRef]);

    const restoreState = useCallback(() => {
        if (!colState) {
            return;
        }

        gridRef.current!.api.applyColumnState({
            state: colState,
            applyOrder: true,
        });
    }, [gridRef, colState]);

    const resetState = useCallback(() => {
        gridRef.current!.api.resetColumnState();
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.controls}>
                <div className={styles.controlsFilter}>
                    <span>Quick Filter:</span>
                    <input type="text" id="filter-text-box" placeholder="Filter..." onInput={onFilterTextBoxChanged} />
                </div>
                <div className={styles.controlsState}>
                    <button className={`button-secondary ${styles.copyFilteredRows}`} onClick={copyFilteredRows}>
                        Copy Filtered Rows
                    </button>
                    <button className="button-secondary" onClick={saveState}>
                        Save
                    </button>
                    <button className="button-secondary" onClick={restoreState} disabled={!colState}>
                        Restore
                    </button>
                    <button className="button-secondary" onClick={resetState}>
                        Reset
                    </button>
                </div>
            </div>
            <AgGridReact
                ref={gridRef}
                modules={[
                    AllCommunityModule,
                    StatusBarModule,
                    RowGroupingModule,
                    SideBarModule,
                    FiltersToolPanelModule,
                    ColumnsToolPanelModule,
                    RowGroupingPanelModule,
                    SetFilterModule,
                ]}
                rowData={exampleContents}
                columnDefs={colDefs}
                defaultColDef={defaultColDef}
                statusBar={statusBar}
                sideBar={sideBar}
                autoGroupColumnDef={autoGroupColumnDef}
                groupDisplayType={groupDisplayType}
                rowGroupPanelShow={rowGroupPanelShow}
                groupDefaultExpanded={groupDefaultExpanded}
                onGridReady={onGridReady}
                onColumnVisible={onColumnVisible}
            />
        </div>
    );
};
