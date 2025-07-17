import React, { StrictMode, useCallback, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type {
    ColDef,
    EditableCallbackParams,
    GetRowIdParams,
    GridApi,
    GridReadyEvent,
    RowEditingStoppedEvent,
    RowSelectionOptions,
} from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    ModuleRegistry,
    NumberEditorModule,
    PinnedRowModule,
    RowSelectionModule,
    TextEditorModule,
    TextFilterModule,
    ValidationModule,
} from 'ag-grid-community';
import { CellSelectionModule, RowGroupingModule, StatusBarModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

ModuleRegistry.registerModules([
    ColumnApiModule,
    TextFilterModule,
    RowSelectionModule,
    ClientSideRowModelModule,
    RowGroupingModule,
    StatusBarModule,
    CellSelectionModule,
    TextEditorModule,
    NumberEditorModule,
    PinnedRowModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

// creates a unique symbol, eg 'ADG' or 'ZJD'
function createUniqueRandomSymbol(data: any[]) {
    let symbol: string = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let isUnique = false;
    while (!isUnique) {
        symbol = '';
        // create symbol
        for (let i = 0; i < 3; i++) {
            symbol += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        // check uniqueness
        isUnique = true;
        data.forEach(function (oldItem) {
            if (oldItem.symbol === symbol) {
                isUnique = false;
            }
        });
    }
    return symbol;
}

function getInitialData() {
    const data: any[] = [];
    for (let i = 0; i < 5; i++) {
        data.push(createItem(data));
    }
    return data;
}

function createItem(data: any[]) {
    const item = {
        group: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
        symbol: createUniqueRandomSymbol(data),
        price: Math.floor(Math.random() * 100),
    };
    return item;
}

const rowSelection: RowSelectionOptions = {
    mode: 'multiRow',
    groupSelects: 'descendants',
    headerCheckbox: false,
};

const GridExample = () => {
    const gridRef = useRef<AgGridReact>(null);
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [gridApi, setGridApi] = useState<GridApi>();
    const [rowData, setRowData] = useState(getInitialData());
    const [pinnedBottomRowData, setPinnedBottomRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
        { headerName: 'Symbol', field: 'symbol' },
        { headerName: 'Price', field: 'price' },
        { headerName: 'Group', field: 'group' },
    ]);
    const defaultColDef = useMemo<ColDef>(() => {
        return {
            width: 250,
            editable: (params: EditableCallbackParams) => {
                return params.node.id === 'new-row';
            },
        };
    }, []);
    const autoGroupColumnDef = useMemo<ColDef>(() => {
        return {
            headerName: 'Symbol',
            cellRenderer: 'agGroupCellRenderer',
            field: 'symbol',
        };
    }, []);
    const statusBar = useMemo(() => {
        return {
            statusPanels: [{ statusPanel: 'agAggregationComponent', align: 'right' }],
        };
    }, []);
    const getRowId = useCallback(function (params: GetRowIdParams) {
        return params.data.symbol ?? 'new-row';
    }, []);

    const onGridReady = useCallback((params: GridReadyEvent) => {
        setGridApi(params.api);
    }, []);

    const addNewRow = useCallback(() => {
        gridApi!.setGridOption('pinnedBottomRowData', [{ symbol: null, price: null, group: null }]);
        setTimeout(() => {
            gridApi!.startEditingCell({ rowIndex: 0, rowPinned: 'bottom', colKey: 'symbol' });
        });
    }, [gridApi]);

    const commitNewRow = useCallback(
        (newRow: { group: string; symbol: string; price: number }) => {
            const newStore = rowData.slice();

            newStore.splice(0, 0, newRow);
            setRowData(newStore);
        },
        [rowData]
    );

    const onRowEditingStopped = useCallback((params: RowEditingStoppedEvent) => {
        const { symbol, price, group } = params.data;

        setPinnedBottomRowData([]);

        if (symbol == null && price == null && group == null) {
            return;
        }

        commitNewRow({ symbol, group, price });
    }, []);

    return (
        <div style={containerStyle}>
            <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
                <div>
                    <div style={{ marginBottom: '5px', minHeight: '30px' }}>
                        <button onClick={addNewRow}>Add New Row</button>
                    </div>
                </div>
                <div style={{ flex: '1 1 0px' }}>
                    <div style={gridStyle}>
                        <AgGridReact
                            ref={gridRef}
                            rowData={rowData}
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            rowSelection={rowSelection}
                            cellSelection={true}
                            editType={'fullRow'}
                            autoGroupColumnDef={autoGroupColumnDef}
                            statusBar={statusBar}
                            groupDefaultExpanded={1}
                            getRowId={getRowId}
                            onGridReady={onGridReady}
                            pinnedBottomRowData={pinnedBottomRowData}
                            onRowEditingStopped={onRowEditingStopped}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);
