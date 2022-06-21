'use strict';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';
import { AgGridReact } from '@ag-grid-community/react';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { MasterDetailModule } from '@ag-grid-enterprise/master-detail';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';
import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import { render } from 'react-dom';

import { ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule, MasterDetailModule, MenuModule, ColumnsToolPanelModule, RangeSelectionModule]);

// this is a hook, but we work also with classes
function MyRenderer(params) {
    return (
        <span className="my-renderer">
            <img src="https://d1yk6z6emsz7qy.cloudfront.net/static/images/loading.gif" className="my-spinner" />
            {params.value}
        </span>
    );
}

function GridExample() {

    const [rowData, setRowData] = useState(null);

    const gridRef = useRef(null);

    useEffect(() => {
        fetch('https://www.ag-grid.com/example-assets/master-detail-data.json')
            .then(resp => resp.json())
            .then(data => {
                setRowData(data);
                setTimeout(() => gridRef.current.api.getDisplayedRowAtIndex(1).setExpanded(true), 100);
            });
    }, []);

    const columnDefs = useMemo(() => [
        { field: 'name', cellRenderer: 'agGroupCellRenderer' },
        { field: 'account', cellRenderer: MyRenderer },
        { field: 'calls' },
        { field: 'minutes', valueFormatter: "x.toLocaleString() + 'm'" }
    ], []);

    const detailGridOptions = useMemo(() => ({
        rowSelection: "multiple",
        suppressRowClickSelection: true,
        enableRangeSelection: true,
        pagination: true,
        paginationAutoPageSize: true,
        columnDefs: [
            {
                field: "callId",
                checkboxSelection: true
            },
            {
                field: "direction",
                cellRenderer: MyRenderer
            },
            {
                field: "number",
                minWidth: 150
            },
            {
                field: "duration",
                valueFormatter: "x.toLocaleString() + 's'"
            },
            {
                field: "switchCode",
                minWidth: 150
            }
        ],
        defaultColDef: {
            sortable: true,
            flex: 1
        }
    }), []);

    const detailCellRendererParams = useMemo(() => ({
        detailGridOptions: detailGridOptions,
        getDetailRowData: params => params.successCallback(params.data.callRecords)
    }), []);

    return (
        <AgGridReact
            ref={gridRef}
            className="ag-theme-alpine"
            columnDefs={columnDefs}
            defaultColDef={{ flex: 1 }}
            masterDetail={true}
            detailCellRendererParams={detailCellRendererParams}
            rowData={rowData}
        />
    );

}

render(<GridExample></GridExample>, document.querySelector('#root'))
