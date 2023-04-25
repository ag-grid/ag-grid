
'use strict';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';
import './styles.css';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule])



var aggCallCount = 0;

var compareCallCount = 0;

var filterCallCount = 0;

const myAggFunc = (params) => {
    aggCallCount++;
    var total = 0;
    for (var i = 0; i < params.values.length; i++) {
        total += params.values[i];
    }
    return total;
}

const myComparator = (a, b) => {
    compareCallCount++;
    return a < b ? -1 : 1;
}

const getMyFilter = () => {
    class MyFilter {
        init(params) {
            this.filterParams = params;
            this.filterValue = null;
            this.eGui = document.createElement('div');
            this.eGui.innerHTML = '<div>Greater Than: <input type="text"/></div>';
            this.eInput = this.eGui.querySelector('input');
            this.eInput.addEventListener('input', () => {
                this.getValueFromInput();
                params.filterChangedCallback();
            });
        }
        getGui() {
            return this.eGui;
        }
        getValueFromInput() {
            var value = parseInt(this.eInput.value);
            this.filterValue = isNaN(value) ? null : value;
        }
        setModel(model) {
            this.eInput.value = model == null ? null : model.value;
            this.getValueFromInput();
        }
        getModel() {
            if (!this.isFilterActive()) {
                return null;
            }
            return { value: this.eInput.value };
        }
        isFilterActive() {
            return this.filterValue !== null;
        }
        doesFilterPass(params) {
            filterCallCount++;
            const { api, colDef, column, columnApi, context } = this.filterParams;
            const { node } = params;
            const value = this.filterParams.valueGetter({
                api,
                colDef,
                column,
                columnApi,
                context,
                data: node.data,
                getValue: (field) => node.data[field],
                node,
            });
            return value > (this.filterValue || 0);
        }
    }
    return MyFilter;
}

var myFilter = getMyFilter();

const timeOperation = (name, operation) => {
    aggCallCount = 0;
    compareCallCount = 0;
    filterCallCount = 0;
    var start = new Date().getTime();
    operation();
    var end = new Date().getTime();
    console.log(name +
        ' finished in ' +
        (end - start) +
        'ms, aggCallCount = ' +
        aggCallCount +
        ', compareCallCount = ' +
        compareCallCount +
        ', filterCallCount = ' +
        filterCallCount);
}



const GridExample = () => {
    const gridRef = useRef();
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [rowData, setRowData] = useState();
    const [columnDefs, setColumnDefs] = useState([
        { field: "city", rowGroup: true, hide: true, },
        { field: 'laptop', rowGroup: true, hide: true, },
        { field: 'distro', sort: 'asc', comparator: myComparator },
        { field: 'value', enableCellChangeFlash: true, aggFunc: myAggFunc, filter: myFilter }
    ]);
    const defaultColDef = useMemo(() => {
        return {
            flex: 1,
            filter: true,
            sortable: true,
            resizable: true,
        }
    }, []);
    const autoGroupColumnDef = useMemo(() => {
        return {
            field: 'name',
            cellRendererParams: { checkbox: true },
        }
    }, []);


    const onGridReady = useCallback((params) => {

        params.api.setFilterModel({
            value: { value: '50' },
        });
        timeOperation('Initialisation', function () {
            params.api.setRowData(getData());
        });

    }, []);

    const onBtDuplicate = useCallback(() => {
        var api = gridRef.current.api;
        // get the first child of the
        var selectedRows = api.getSelectedRows();
        if (!selectedRows || selectedRows.length === 0) {
            console.log('No rows selected!');
            return;
        }
        var newItems = [];
        selectedRows.forEach(function (selectedRow) {
            var newItem = createDataItem(selectedRow.name, selectedRow.distro, selectedRow.laptop, selectedRow.city, selectedRow.value);
            newItems.push(newItem);
        });
        timeOperation('Duplicate', function () {
            api.applyTransaction({ add: newItems });
        });
    }, [createDataItem])

    const onBtUpdate = useCallback(() => {
        var api = gridRef.current.api;
        // get the first child of the
        var selectedRows = api.getSelectedRows();
        if (!selectedRows || selectedRows.length === 0) {
            console.log('No rows selected!');
            return;
        }
        var updatedItems = [];
        selectedRows.forEach(function (oldItem) {
            var newValue = Math.floor(Math.random() * 100) + 10;
            var newItem = createDataItem(oldItem.name, oldItem.distro, oldItem.laptop, oldItem.city, newValue, oldItem.id);
            updatedItems.push(newItem);
        });
        timeOperation('Update', function () {
            api.applyTransaction({ update: updatedItems });
        });
    }, [createDataItem])

    const onBtDelete = useCallback(() => {
        var api = gridRef.current.api;
        // get the first child of the
        var selectedRows = api.getSelectedRows();
        if (!selectedRows || selectedRows.length === 0) {
            console.log('No rows selected!');
            return;
        }
        timeOperation('Delete', function () {
            api.applyTransaction({ remove: selectedRows });
        });
    }, [])

    const onBtClearSelection = useCallback(() => {
        gridRef.current.api.deselectAll();
    }, [])

    const getRowId = useCallback((params) => {
        return params.data.id;
    }, [])

    const isGroupOpenByDefault = useCallback((params) => {
        return ['Delhi', 'Seoul'].includes(params.key);
    }, [])


    return (
        <div style={containerStyle}>
            <div className="test-container">
                <div className="test-header">
                    <button onClick={onBtUpdate}>Update</button>
                    <button onClick={onBtDuplicate}>Duplicate</button>
                    <button onClick={onBtDelete}>Delete</button>
                    <button onClick={onBtClearSelection}>Clear Selection</button>
                </div>

                <div style={gridStyle} className="ag-theme-alpine">
                    <AgGridReact
                        ref={gridRef}
                        rowData={rowData}
                        getRowId={getRowId}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        rowSelection={'multiple'}
                        groupSelectsChildren={true}
                        animateRows={true}
                        suppressAggAtRootLevel={true}
                        suppressRowClickSelection={true}
                        autoGroupColumnDef={autoGroupColumnDef}
                        isGroupOpenByDefault={isGroupOpenByDefault}
                        onGridReady={onGridReady}
                    >
                    </AgGridReact>
                </div>
            </div>

        </div>
    );

}

const root = createRoot(document.getElementById('root'));
root.render(<GridExample />);
