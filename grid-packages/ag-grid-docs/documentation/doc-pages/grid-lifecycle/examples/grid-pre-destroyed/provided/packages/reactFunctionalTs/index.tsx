'use strict';

import React, {useCallback, useMemo, useRef, useState, StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {AgGridReact} from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import {
    ColDef,
    ColGroupDef,
    ColumnApi,
    Grid,
    GridApi,
    GridOptions,
    GridPreDestroyedEvent,
    GridReadyEvent
} from 'ag-grid-community';
import {TAthlete, getDataSet} from './data';

interface ColumnWidth {
    field: string;
    width: number;
}

const displayColumnsWidth = (values: ColumnWidth[]) => {
    const parentContainer = document.querySelector<HTMLElement>('#gridPreDestroyedState');
    const valuesContainer = parentContainer?.querySelector<HTMLElement>('.values');
    if (!parentContainer || !valuesContainer) {
        return;
    }
    const html = '<ul>'
        + (values || []).map(value => `<li>Field: ${value.field} | Wdith: ${value.width}px</li>`).join('')
        + '</ul>';
    parentContainer.style.display = 'block';
    valuesContainer.innerHTML = html;
    const exampleButtons = document.querySelector<HTMLElement>('#exampleButtons');
    exampleButtons!.style.display = 'none';
};


const GridExample = () => {
    const gridRef = useRef<AgGridReact>(null);
    const containerStyle = useMemo(() => ({width: '100%', height: '100%'}), []);
    const gridStyle = useMemo(() => ({height: '100%', width: '100%'}), []);
    const [gridVisible, setGridVisible] = useState(true);
    const [columnsWidthOnPreDestroyed, setColumnsWidthOnPreDestroyed] = useState<ColumnWidth[]>([]);
    const [gridColumnApi, setGridColumnApi] = useState<ColumnApi>();
    const [rowData, setRowData] = useState<any[]>(getDataSet());
    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
        {field: 'name', headerName: 'Athlete'},
        {field: 'medals.gold', headerName: 'Gold Medals'},
        {field: 'person.age', headerName: 'Age'},
    ]);
    const defaultColDef = useMemo<ColDef>(() => {
        return {
            editable: true,
            resizable: true,
        }
    }, []);

    const onGridReady = useCallback((params: GridReadyEvent) => {
        setGridColumnApi(params.columnApi);
    }, []);

    const onGridPreDestroyed = useCallback((params: GridPreDestroyedEvent<TAthlete>) => {
        const allColumns = gridColumnApi?.getColumns();
        if (!allColumns) {
            return;
        }

        const currentColumnWidths = allColumns.map(column => ({
            field: column.getColDef().field || '-',
            width: column.getActualWidth(),
        }));

        setColumnsWidthOnPreDestroyed(currentColumnWidths);
        setGridColumnApi(undefined);
    }, [gridColumnApi])

    const updateColumnWidth = useCallback(() => {
        if (!gridColumnApi) {
            return;
        }

        gridColumnApi.getColumns()!.forEach(column => {
            const newRandomWidth = Math.round((150 + Math.random() * 100) * 100) / 100;
            gridColumnApi.setColumnWidth(column, newRandomWidth);
        });
    }, [gridColumnApi])

    const destroyGrid = useCallback(() => {
        setGridVisible(false);
        displayColumnsWidth(columnsWidthOnPreDestroyed);
    }, [])

    const reloadGrid = useCallback(() => {
        const updatedColumnDefs = columnDefs.map(val => {
            const colDef = val;
            const result = {
                ...colDef,
            };

            if (colDef.field) {
                const width = columnsWidthOnPreDestroyed.find(columnWidth => columnWidth.field === colDef.field);
                result.width = width ? width.width : colDef.width;
            }

            return result;
        });

        setColumnsWidthOnPreDestroyed([]);
        setColumnDefs(updatedColumnDefs);
        setGridVisible(true);
    }, [columnsWidthOnPreDestroyed, columnDefs])

    return (
        <div style={containerStyle}>
            <div style={{"height": "100%"}} className="example-wrapper">
                {gridVisible && (
                    <div id="exampleButtons" style={{"marginBottom": "1rem"}}>
                        <button onClick={() => updateColumnWidth()}>Change Columns Width</button>
                        <button onClick={() => destroyGrid()}>Destroy Grid</button>
                    </div>
                )}
                {Array.isArray(columnsWidthOnPreDestroyed) && columnsWidthOnPreDestroyed.length > 0 && (
                    <div id="gridPreDestroyedState">
                        State captured on grid pre-destroyed event:<br/>
                        <strong>Column fields and widths</strong>
                        <div className="values">
                            <ul>
                                {columnsWidthOnPreDestroyed.map((columnWidth, index) => (
                                    <li key={index}>{columnWidth.field} : {columnWidth.width}px</li>
                                ))}
                            </ul>
                        </div>
                        <button onClick={() => reloadGrid()}>Reload Grid</button>
                    </div>
                )}
                <div style={{"height": "100%", "boxSizing": "border-box"}}>
                    <div
                        style={{
                            height: '100%',
                            width: '100%'
                        }}
                        className="ag-theme-alpine">
                        {gridVisible && (
                            <AgGridReact
                                columnDefs={columnDefs}
                                defaultColDef={defaultColDef}
                                rowData={rowData}
                                onGridReady={onGridReady}
                                onGridPreDestroyed={onGridPreDestroyed}
                            />
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}

const root = createRoot(document.getElementById('root')!);
root.render(<StrictMode><GridExample/></StrictMode>);
