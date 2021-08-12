'use strict';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-alpine.css';
import { AgGridReact } from '@ag-grid-community/react';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { MasterDetailModule } from '@ag-grid-enterprise/master-detail';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';
import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import { render } from 'react-dom';

 function GridExample() {

    const [rowData, setRowData] = useState(null);

    const gridRef = useRef();

    useEffect( ()=> {
        fetch('https://www.ag-grid.com/example-assets/master-detail-data.json')
        .then(resp => resp.json())
        .then(data => {
            setRowData(data);
            setTimeout( ()=> gridRef.current.api.getDisplayedRowAtIndex(1).setExpanded(true), 100);
        });
    }, []);

    const columnDefs = useMemo( ()=> [
        { field: 'name', cellRenderer: 'agGroupCellRenderer' },
        { field: 'account' },
        { field: 'calls' },
        { field: 'minutes', valueFormatter: "x.toLocaleString() + 'm'" }
    ], []);

    const modules = useMemo( ()=> [
        ClientSideRowModelModule, MasterDetailModule, MenuModule, ColumnsToolPanelModule, RangeSelectionModule
    ], []);

    const detailGridOptions = useMemo( ()=> ({
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
            { field: "direction" },
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

    const detailCellRendererParams = useMemo( ()=> ({
        detailGridOptions: detailGridOptions,
        getDetailRowData: params => params.successCallback(params.data.callRecords)
    }), []);

    return  (
            <AgGridReact
                reactUi={true}
                ref={gridRef}
                className="ag-theme-alpine"
                columnDefs={columnDefs}
                reactUi={true}
                modules={modules}
                defaultColDef={{ flex: 1 }}
                masterDetail={true}
                detailCellRendererParams={detailCellRendererParams}
                rowData={rowData}
            />
        );

}

render(<GridExample></GridExample>, document.querySelector('#root'))
