import React, { useCallback, useEffect, useState } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';
import { ExcelExportModule, exportMultipleSheetsAsExcel } from '@ag-grid-enterprise/excel-export';

import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";

import { ColDef, ColumnApi, GetRowIdParams, GridApi, GridReadyEvent, ICellRendererParams, ModuleRegistry, RowDragEndEvent } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule, CsvExportModule, ExcelExportModule]);

const SportRenderer = (props: ICellRendererParams) => {
    return (
        <i className="far fa-trash-alt"
            style={{ cursor: 'pointer' }}
            onClick={() => props.api.applyTransaction({ remove: [props.node.data] })}>
        </i>
    )
}

const leftColumns: ColDef[] = [
    {
        rowDrag: true,
        maxWidth: 50,
        suppressMenu: true,
        rowDragText: (params, dragItemCount) => {
            if (dragItemCount > 1) {
                return dragItemCount + ' athletes';
            }
            return params.rowNode!.data.athlete;
        },
    },
    { field: "athlete" },
    { field: "sport" }
];

const rightColumns: ColDef[] = [
    {
        rowDrag: true,
        maxWidth: 50,
        suppressMenu: true,
        rowDragText: (params, dragItemCount) => {
            if (dragItemCount > 1) {
                return dragItemCount + ' athletes';
            }
            return params.rowNode!.data.athlete;
        },
    },
    { field: "athlete" },
    { field: "sport" },
    {
        suppressMenu: true,
        maxWidth: 50,
        cellRenderer: SportRenderer
    }
]

const defaultColDef: ColDef = {
    flex: 1,
    minWidth: 100,
    sortable: true,
    filter: true,
    resizable: true
};

const GridExample = () => {
    const [leftApi, setLeftApi] = useState<GridApi | null>(null);
    const [leftColumnApi, setLeftColumnApi] = useState<ColumnApi | null>(null);
    const [rightApi, setRightApi] = useState<GridApi | null>(null);
    const [rawData, setRawData] = useState<any[]>([]);
    const [leftRowData, setLeftRowData] = useState<any[] | null>(null);
    const [rightRowData, setRightRowData] = useState<any[]>([]);

    useEffect(() => {
        if (!rawData.length) {
            fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
                .then(resp => resp.json())
                .then(data => {
                    const athletes: any[] = [];
                    let i = 0;

                    while (athletes.length < 20 && i < data.length) {
                        var pos = i++;
                        if (athletes.some(rec => rec.athlete === data[pos].athlete)) { continue; }
                        athletes.push(data[pos]);
                    }
                    setRawData(athletes);
                });
        }
    }, [rawData]);

    const loadGrids = useCallback(() => {
        setLeftRowData([...rawData.slice(0, rawData.length / 2)]);
        setRightRowData([...rawData.slice(rawData.length / 2)]);
        leftApi!.deselectAll();
    }, [leftApi, rawData]);

    useEffect(() => {
        if (rawData.length) {
            loadGrids();
        }
    }, [rawData, loadGrids]);

    const reset = () => {
        loadGrids();
    }

    const onExcelExport = () => {
        var spreadsheets: any[] = [];

        spreadsheets.push(
            leftApi!.getSheetDataForExcel({ sheetName: 'Athletes' }),
            rightApi!.getSheetDataForExcel({ sheetName: 'Selected Athletes' })
        );

        exportMultipleSheetsAsExcel({
            data: spreadsheets,
            fileName: 'ag-grid.xlsx'
        });
    }

    const getRowId = (params: GetRowIdParams) => params.data.athlete

    const onDragStop = useCallback((params: RowDragEndEvent) => {
        var nodes = params.nodes;

        leftApi!.applyTransaction({
            remove: nodes.map(function (node) { return node.data; })
        });
    }, [leftApi]);

    useEffect(() => {
        if (!leftApi || !rightApi) { return; }
        const dropZoneParams = rightApi.getRowDropZoneParams({ onDragStop });

        leftApi.removeRowDropZone(dropZoneParams);
        leftApi.addRowDropZone(dropZoneParams);
    }, [leftApi, rightApi, onDragStop]);

    const onGridReady = (params: GridReadyEvent, side: number) => {
        if (side === 0) {
            setLeftApi(params.api);
            setLeftColumnApi(params.columnApi);
        }

        if (side === 1) {
            setRightApi(params.api);
        }
    };

    const getTopToolBar = () => (
        <div>
            <button type="button" className="btn btn-default excel" style={{ marginRight: 5 }} onClick={onExcelExport}>
                <i className="far fa-file-excel" style={{ marginRight: 5, color: 'green' }}></i>Export to Excel
            </button>
            <button type="button" className="btn btn-default reset" onClick={reset}>
                <i className="fas fa-redo" style={{ marginRight: 5 }}></i>Reset
            </button>
        </div>
    );

    const getGridWrapper = (id: number) => (
        <div className="panel panel-primary" style={{ marginRight: '10px' }}>
            <div className="panel-heading">{id === 0 ? 'Athletes' : 'Selected Athletes'}</div>
            <div className="panel-body" style={{ height: '100%' }}>
                <AgGridReact
                    defaultColDef={defaultColDef}
                    getRowId={getRowId}
                    rowDragManaged={true}
                    animateRows={true}
                    rowSelection={id === 0 ? "multiple" : undefined}
                    rowDragMultiRow={id === 0}
                    suppressMoveWhenRowDragging={id === 0}

                    rowData={id === 0 ? leftRowData : rightRowData}
                    columnDefs={id === 0 ? leftColumns : rightColumns}
                    onGridReady={(params) => onGridReady(params, id)}
                >
                </AgGridReact>
            </div>
        </div>
    )

    return (
        <div className="top-container">
            {getTopToolBar()}
            <div className="grid-wrapper ag-theme-alpine">
                {getGridWrapper(0)}
                {getGridWrapper(1)}
            </div>
        </div>
    );
}

render(
    <GridExample></GridExample>,
    document.querySelector('#root')
)
