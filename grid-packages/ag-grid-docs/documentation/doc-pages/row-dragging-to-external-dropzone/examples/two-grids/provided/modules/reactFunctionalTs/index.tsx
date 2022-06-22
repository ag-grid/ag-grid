import React, { useCallback, useEffect, useRef, useState } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";

import { ModuleRegistry, ColDef, GridApi, GridReadyEvent, GetRowIdParams, RowDropZoneParams } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const columns: ColDef[] = [
    { field: "id", rowDrag: true },
    { field: "color" },
    { field: "value1" },
    { field: "value2" }
];

const rowClassRules = {
    "red-row": 'data.color == "Red"',
    "green-row": 'data.color == "Green"',
    "blue-row": 'data.color == "Blue"',
};

const defaultColDef: ColDef = {
    flex: 1,
    minWidth: 100,
    sortable: true,
    filter: true,
    resizable: true
};

const GridExample = () => {
    const [leftApi, setLeftApi] = useState<GridApi | null>(null);
    const [rightApi, setRightApi] = useState<GridApi | null>(null);
    const [leftRowData, setLeftRowData] = useState<any[]>([]);
    const [rightRowData] = useState<any[]>([]);

    const eLeftGrid = useRef(null);
    const eRightGrid = useRef(null);
    const eBin = useRef<HTMLElement>(null);
    const eBinIcon = useRef<HTMLElement>(null);

    let rowIdSequence = 100;

    const createDataItem = useCallback((color: string) => {
        const obj = {
            id: rowIdSequence++,
            color: color,
            value1: Math.floor(Math.random() * 100),
            value2: Math.floor(Math.random() * 100)
        };

        return obj;
    }, [rowIdSequence]);

    useEffect(() => {
        const createLeftRowData = () => ['Red', 'Green', 'Blue'].map((color) => createDataItem(color))
        setLeftRowData(createLeftRowData());
    }, [createDataItem]);


    const getRowId = (params: GetRowIdParams) => params.data.id

    const addRecordToGrid = (side: string, data: any) => {
        // if data missing or data has no it, do nothing
        if (!data || data.id == null) { return; }

        const api = side === 'left' ? leftApi : rightApi;
        // do nothing if row is already in the grid, otherwise we would have duplicates
        const rowAlreadyInGrid = !!api!.getRowNode(data.id);
        let transaction;

        if (rowAlreadyInGrid) {
            console.log('not adding row to avoid duplicates in the grid');
            return;
        }

        transaction = {
            add: [data]
        };

        api!.applyTransaction(transaction);
    };

    const onFactoryButtonClick = (e: any) => {
        var button = e.currentTarget,
            buttonColor = button.getAttribute('data-color'),
            side = button.getAttribute('data-side'),
            data = createDataItem(buttonColor);

        addRecordToGrid(side, data);
    };

    const binDrop = (data: any) => {
        // if data missing or data has no id, do nothing
        if (!data || data.id == null) { return; }

        var transaction = {
            remove: [data]
        };

        [leftApi, rightApi].forEach((api) => {
            var rowsInGrid = !!api!.getRowNode(data.id);

            if (rowsInGrid) {
                api!.applyTransaction(transaction);
            }
        });
    };

    const addBinZone = (api: GridApi) => {
        const dropZone: RowDropZoneParams = {
            getContainer: () => eBinIcon.current!,
            onDragEnter: () => {
                eBin.current!.style.color = 'blue';
                eBinIcon.current!.style.transform = 'scale(1.5)';
            },
            onDragLeave: () => {
                eBin.current!.style.color = 'black';
                eBinIcon.current!.style.transform = 'scale(1)';
            },
            onDragStop: (params) => {
                binDrop(params.node.data);
                eBin.current!.style.color = 'black';
                eBinIcon.current!.style.transform = 'scale(1)';
            }
        };

        api.addRowDropZone(dropZone);
    };

    const addGridDropZone = (side: string, api: GridApi) => {
        const dropSide = side === 'Left' ? 'Right' : 'Left';
        const dropZone: RowDropZoneParams = {
            getContainer: () => dropSide === 'Right' ? eRightGrid.current! : eLeftGrid.current!,
            onDragStop: (dragParams) => addRecordToGrid(dropSide.toLowerCase(), dragParams.node.data)
        };

        api.addRowDropZone(dropZone);
    };

    useEffect(() => {
        if (rightApi && leftApi) {
            addBinZone(rightApi);
            addBinZone(leftApi);
            addGridDropZone('Right', rightApi);
            addGridDropZone('Left', leftApi);
        }
    })

    const onGridReady = (side: string, params: GridReadyEvent) => {
        if (side === 'Left') {
            setLeftApi(params.api);
        } else {
            setRightApi(params.api);
        }
    }

    const getAddRecordButton = (side: string, color: string) => (
        <button
            key={`btn_${side}_${color}`}
            className={`factory factory-${color.toLowerCase()}`}
            data-color={color}
            data-side={side.toLowerCase()}
            onClick={onFactoryButtonClick}
        >
            <i className="far fa-plus-square"></i>{`Add ${color}`}
        </button>
    )

    const getInnerGridCol = (side: string) => (
        <div className="inner-col">
            <div className="toolbar">
                {['Red', 'Green', 'Blue'].map(color => getAddRecordButton(side, color))}
            </div>
            <div style={{ height: '100%' }} className="inner-col" ref={side === 'Left' ? eLeftGrid : eRightGrid}>
                <AgGridReact
                    defaultColDef={defaultColDef}
                    getRowId={getRowId}
                    rowClassRules={rowClassRules}
                    rowDragManaged={true}
                    suppressMoveWhenRowDragging={true}
                    animateRows={true}
                    rowData={side === 'Left' ? leftRowData : rightRowData}
                    columnDefs={[...columns]}
                    onGridReady={params => onGridReady(side, params)}
                />
            </div>
        </div>
    )

    return (
        <div className="example-wrapper ag-theme-alpine">
            {getInnerGridCol('Left')}
            <div className="inner-col vertical-toolbar">
                <span className="bin" ref={eBin}>
                    <i className="far fa-trash-alt fa-3x" ref={eBinIcon}></i>
                </span>
            </div>
            {getInnerGridCol('Right')}
        </div>
    );
}


render(<GridExample></GridExample>, document.querySelector('#root'))
