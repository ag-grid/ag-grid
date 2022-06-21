import React, { useCallback, useEffect, useState } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";

import { ColDef, ColumnApi, GetRowIdParams, GridApi, GridReadyEvent, ICellRendererParams, ModuleRegistry, RowDragEndEvent } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule]);

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
    {
        colId: 'checkbox',
        maxWidth: 50,
        checkboxSelection: true,
        suppressMenu: true,
        headerCheckboxSelection: true
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
    const [radioChecked, setRadioChecked] = useState(0);
    const [checkBoxSelected, setCheckBoxSelected] = useState(true);

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
        setLeftRowData([...rawData]);
        setRightRowData([]);
        leftApi!.deselectAll();
    }, [leftApi, rawData]);

    useEffect(() => {
        if (rawData.length) {
            loadGrids();
        }
    }, [rawData, loadGrids]);

    useEffect(() => {
        if (leftColumnApi && leftApi) {
            leftColumnApi.setColumnVisible('checkbox', checkBoxSelected);
            leftApi.setSuppressRowClickSelection(checkBoxSelected);
        }
    }, [leftColumnApi, leftApi, checkBoxSelected]);

    const reset = () => {
        setRadioChecked(0);
        setCheckBoxSelected(true);
        loadGrids();
    }

    const onRadioChange = (e: any) => {
        setRadioChecked(parseInt(e.target.value, 10));
    }

    const onCheckboxChange = (e: any) => {
        const checked = e.target.checked;
        setCheckBoxSelected(checked);
    }

    const getRowId = (params: GetRowIdParams) => params.data.athlete

    const onDragStop = useCallback((params: RowDragEndEvent) => {
        var nodes = params.nodes;

        if (radioChecked === 0) {
            leftApi!.applyTransaction({
                remove: nodes.map(function (node) { return node.data; })
            });
        } else if (radioChecked === 1) {
            nodes.forEach(function (node) {
                node.setSelected(false);
            });
        }
    }, [leftApi, radioChecked]);

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
        <div className="example-toolbar panel panel-default">
            <div className="panel-body">
                <div style={{ display: 'inline-flex' }} onChange={onRadioChange} >
                    <input type="radio" id="move" name="radio" value="0" checked={radioChecked === 0} />
                    <label htmlFor="move">Remove Source Rows</label>
                    <input type="radio" id="deselect" name="radio" value="1" checked={radioChecked === 1} />
                    <label htmlFor="deselect">Only Deselect Source Rows</label>
                    <input type="radio" id="none" name="radio" value="2" checked={radioChecked === 2} />
                    <label htmlFor="none">None</label>
                </div>
                <input type="checkbox" id="toggleCheck" checked={checkBoxSelected} onChange={onCheckboxChange} />
                <label htmlFor="toggleCheck">Checkbox Select</label>
                <span className="input-group-button">
                    <button type="button" className="btn btn-default reset" style={{ marginLeft: '5px;' }} onClick={reset}>
                        <i className="fas fa-redo" style={{ marginRight: '5px;' }}></i>Reset
                    </button>
                </span>
            </div>
        </div>
    );

    const getGridWrapper = (id: number) => (
        <div className="panel panel-primary" style={{ marginRight: '10px' }}>
            <div className="panel-heading">{id === 0 ? 'Athletes' : 'Selected Athletes'}</div>
            <div className="panel-body" style={{ height: '100%;' }}>
                <AgGridReact
                    defaultColDef={defaultColDef}
                    getRowId={getRowId}
                    rowDragManaged={true}
                    animateRows={true}
                    rowSelection={id === 0 ? "multiple" : undefined}
                    rowDragMultiRow={id === 0}
                    suppressRowClickSelection={id === 0}
                    suppressMoveWhenRowDragging={id === 0}

                    rowData={id === 0 ? leftRowData : rightRowData}
                    columnDefs={id === 0 ? leftColumns : rightColumns}
                    onGridReady={(params) => onGridReady(params, id)}>
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
