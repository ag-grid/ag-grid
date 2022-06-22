'use strict';

import React, { Component, dangerouslySetInnerHTML, useMemo, useEffect, useState } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { RichSelectModule } from '@ag-grid-enterprise/rich-select';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';

import { ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule, RangeSelectionModule, RowGroupingModule, RichSelectModule]);

// this is a hook, but we work also with classes
function MyRenderer(params) {
    return (
        <span className="my-renderer">
            {params.value != null &&
                <React.Fragment>
                    <img src="https://d1yk6z6emsz7qy.cloudfront.net/static/images/loading.gif" className="my-spinner" />
                    <span class="my-renderer-value">
                        {params.value}
                    </span>
                </React.Fragment>
            }
        </span>
    );
}

function GridExample() {

    // never changes, so we can use useMemo
    const columnDefs = useMemo(() => [
        { field: 'sport', enableRowGroup: true, hide: true, rowGroup: true, cellRenderer: MyRenderer },
        { field: 'country', enableRowGroup: true, rowGroup: true, hide: true },
        { field: 'athlete', enableRowGroup: true, hide: true },
        { field: 'gold', aggFunc: 'sum' },
        { field: 'silver', aggFunc: 'sum' },
        { field: 'bronze', aggFunc: 'sum' },
        { field: 'total', aggFunc: 'sum' }
    ], []);

    // never changes, so we can use useMemo
    const defaultColDef = useMemo(() => ({
        resizable: true,
        sortable: true
    }), []);

    // never changes, so we can use useMemo
    const autoGroupColumnDef = useMemo(() => ({
        cellRendererParams: {
            suppressCount: true,
            checkbox: true
        },
        field: 'athlete',
        width: 300
    }), []);

    // changes, needs to be state
    const [rowData, setRowData] = useState();

    // gets called once, no dependencies, loads the grid data
    useEffect(() => {
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then(resp => resp.json())
            .then(data => setRowData(data));
    }, []);

    return (
        <AgGridReact
            className="ag-theme-alpine"
            animateRows="true"
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            autoGroupColumnDef={autoGroupColumnDef}
            rowGroupPanelShow="always"
            enableRangeSelection="true"
            rowData={rowData}
            rowSelection="multiple"
            groupSelectsChildren="true"
            suppressRowClickSelection="true"
        />
    );
}

render(<GridExample></GridExample>, document.querySelector('#root'));
