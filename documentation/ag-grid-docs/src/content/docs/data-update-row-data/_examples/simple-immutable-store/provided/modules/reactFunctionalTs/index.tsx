'use strict';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import {
    ColDef,
    GetRowIdParams,
    GridApi,
    GridReadyEvent,
    ModuleRegistry,
    SelectionOptions,
} from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { StatusBarModule } from '@ag-grid-enterprise/status-bar';
import React, { StrictMode, useCallback, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule, StatusBarModule, RangeSelectionModule]);

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

function setGroupingEnabled(enabled: boolean, api: GridApi) {
    if (enabled) {
        api.applyColumnState({
            state: [
                { colId: 'group', rowGroup: true, hide: true },
                { colId: 'symbol', hide: true },
            ],
        });
    } else {
        api.applyColumnState({
            state: [
                { colId: 'group', rowGroup: false, hide: false },
                { colId: 'symbol', hide: false },
            ],
        });
    }
    setItemVisible('groupingOn', !enabled);
    setItemVisible('groupingOff', enabled);
}

function setItemVisible(id: string, visible: boolean) {
    const element = document.querySelector('#' + id) as any;
    element.style.display = visible ? 'inline' : 'none';
}

const selection: SelectionOptions = {
    mode: 'multiRow',
    groupSelects: 'descendants',
    headerCheckbox: false,
};

const GridExample = () => {
    const gridRef = useRef<AgGridReact>(null);
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [rowData, setRowData] = useState(getInitialData());
    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
        { headerName: 'Symbol', field: 'symbol' },
        { headerName: 'Price', field: 'price' },
        { headerName: 'Group', field: 'group' },
    ]);
    const defaultColDef = useMemo<ColDef>(() => {
        return {
            width: 250,
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
        return params.data.symbol;
    }, []);

    const onGridReady = useCallback((params: GridReadyEvent) => {
        setGroupingEnabled(false, params.api);
    }, []);

    const addFiveItems = useCallback(
        (append: boolean) => {
            const newStore = rowData.slice();
            for (let i = 0; i < 5; i++) {
                const newItem = createItem(newStore);
                if (append) {
                    newStore.push(newItem);
                } else {
                    newStore.splice(0, 0, newItem);
                }
            }
            setRowData(newStore);
        },
        [rowData]
    );

    const removeSelected = useCallback(() => {
        const selectedRowNodes = gridRef.current!.api.getSelectedNodes();
        const selectedIds = selectedRowNodes.map(function (rowNode) {
            return rowNode.id;
        });
        const filteredData = rowData.filter(function (dataItem) {
            return selectedIds.indexOf(dataItem.symbol) < 0;
        });
        setRowData(filteredData);
    }, [rowData]);

    const setSelectedToGroup = useCallback(
        (newGroup: string) => {
            const selectedRowNodes = gridRef.current!.api.getSelectedNodes();
            const selectedIds = selectedRowNodes.map(function (rowNode) {
                return rowNode.id;
            });
            const newData = rowData.map(function (dataItem) {
                const itemSelected = selectedIds.indexOf(dataItem.symbol) >= 0;
                if (itemSelected) {
                    return {
                        // symbol and price stay the same
                        symbol: dataItem.symbol,
                        price: dataItem.price,
                        // group gets the group
                        group: newGroup,
                    };
                } else {
                    return dataItem;
                }
            });
            setRowData(newData);
        },
        [rowData]
    );

    const updatePrices = useCallback(() => {
        const newStore: any[] = [];
        rowData.forEach(function (item) {
            newStore.push({
                // use same symbol as last time, this is the unique id
                symbol: item.symbol,
                // group also stays the same
                group: item.group,
                // add random price
                price: Math.floor(Math.random() * 100),
            });
        });
        setRowData(newStore);
    }, [rowData]);

    const onGroupingEnabled = useCallback((enabled: boolean) => {
        setGroupingEnabled(enabled, gridRef.current!.api);
    }, []);

    const reverseItems = useCallback(() => {
        const reversedData = rowData.slice().reverse();
        setRowData(reversedData);
    }, [rowData]);

    return (
        <div style={containerStyle}>
            <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
                <div>
                    <div style={{ marginBottom: '5px', minHeight: '30px' }}>
                        <button onClick={reverseItems}>Reverse</button>
                        <button onClick={() => addFiveItems(true)}>Append</button>
                        <button onClick={() => addFiveItems(false)}>Prepend</button>
                        <button onClick={removeSelected}>Remove Selected</button>
                        <button onClick={updatePrices}>Update Prices</button>
                    </div>
                    <div style={{ marginBottom: '5px', minHeight: '30px' }}>
                        <button id="groupingOn" onClick={() => onGroupingEnabled(true)}>
                            Grouping On
                        </button>
                        <button id="groupingOff" onClick={() => onGroupingEnabled(false)}>
                            Grouping Off
                        </button>
                        <button onClick={() => setSelectedToGroup('A')}>Move to Group A</button>
                        <button onClick={() => setSelectedToGroup('B')}>Move to Group B</button>
                        <button onClick={() => setSelectedToGroup('C')}>Move to Group C</button>
                    </div>
                </div>
                <div style={{ flex: '1 1 0px' }}>
                    <div
                        style={gridStyle}
                        className={
                            /** DARK MODE START **/ document.documentElement?.dataset.defaultTheme ||
                            'ag-theme-quartz' /** DARK MODE END **/
                        }
                    >
                        <AgGridReact
                            ref={gridRef}
                            rowData={rowData}
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            selection={selection}
                            autoGroupColumnDef={autoGroupColumnDef}
                            statusBar={statusBar}
                            groupDefaultExpanded={1}
                            getRowId={getRowId}
                            onGridReady={onGridReady}
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
