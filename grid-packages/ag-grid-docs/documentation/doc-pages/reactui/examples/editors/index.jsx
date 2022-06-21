'use strict';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';
import { AgGridReact } from '@ag-grid-community/react';
import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';
import { RichSelectModule } from '@ag-grid-enterprise/rich-select';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import React, { forwardRef, memo, useEffect, useImperativeHandle, useMemo, useRef, useState, useCallback } from 'react';
import { render } from 'react-dom';

import { ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule, RangeSelectionModule, RowGroupingModule, RichSelectModule]);

const MyReactEditor = memo(forwardRef((props, ref) => {

    const [value, setValue] = useState(parseInt(props.value));
    const refInput = useRef(null);

    // Cell Editor interface, that the grid calls
    useImperativeHandle(ref, () => {
        return {
            // the final value to send to the grid, on completion of editing
            getValue() {
                // this simple editor doubles any value entered into the input
                return value;
            }
        };
    });

    const onChangeListener = useCallback(event => setValue(event.target.value), []);
    useEffect(() => refInput.current.focus(), []);

    return (
        <input type="number" className="my-editor"
            ref={refInput}
            value={value}
            onChange={onChangeListener}
        />
    );
}));


function GridExample() {

    // never changes, so we can use useMemo
    const columnDefs = useMemo(() => [
        {
            field: 'country'
        },
        {
            field: 'athlete',
        },
        {
            field: 'gold',
            editable: true,
            cellEditor: MyReactEditor
        },
        {
            field: 'silver',
            cellEditor: MyReactEditor,
            cellEditorPopup: true
        }
    ], []);

    // never changes, so we can use useMemo
    const defaultColDef = useMemo(() => ({
        resizable: true,
        editable: true,
        sortable: true,
        flex: 1
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
            rowData={rowData}
        />
    );
}

render(<GridExample></GridExample>, document.querySelector('#root'));
