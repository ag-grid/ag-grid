'use strict';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-alpine.css';
import { AgGridReact } from '@ag-grid-community/react';
import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';
import { RichSelectModule } from '@ag-grid-enterprise/rich-select';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import React, { forwardRef, memo, useEffect, useImperativeHandle, useMemo, useRef, useState, useCallback } from 'react';
import { render } from 'react-dom';

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
 
    const onChangeListener = useCallback( event => setValue(event.target.value), []);
    const onKeyDownListener = useCallback( event => {
        if (event.key === 'Enter') {
            props.stopEditing();
        }
    }, []);

    useEffect( ()=> refInput.current.focus(), []);

    return (
        <input type="number" className="my-editor"
               ref={refInput}
               value={value}
               onChange={onChangeListener}
               onKeyDown={onKeyDownListener}
        />
    );
 }));

class MyJavaScriptEditor {
    init(props) {
        this.gui = document.createElement('input');
        this.gui.type = 'number';
        this.gui.className = 'my-editor'
        this.gui.value = props.value;
        this.gui.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                props.stopEditing();
            }
        });
    }
    afterGuiAttached() {
        this.gui.focus();
    }
    getGui() {
        return this.gui;
    }
    getValue() {
        return this.gui.value;
    }
}

 function GridExample() {

    // never changes, so we can use useMemo
    const modules = useMemo( ()=> [ClientSideRowModelModule, RangeSelectionModule, RowGroupingModule, RichSelectModule], []);

    // never changes, so we can use useMemo
    const columnDefs = useMemo( ()=> [
        {
            field: 'country'
        },
        {
            field: 'athlete',
        },
        {
            headerName: 'JS Inline',
            field: 'gold',
            editable: true,
            cellEditor: MyJavaScriptEditor
        },
        {
            field: 'silver',
            headerName: 'JS Popup',
            cellEditor: MyJavaScriptEditor,
            cellEditorPopup: true,
            cellEditorPopupPosition: 'under'
        },
        {
            headerName: 'React Inline',
            field: 'bronze',
            editable: true,
            cellEditorFramework: MyReactEditor
        },
        {
            field: 'total',
            headerName: 'React Popup',
            cellEditorFramework: MyReactEditor,
            cellEditorPopup: true,
            cellEditorPopupPosition: 'under'
        }
    ], []);

    // never changes, so we can use useMemo
    const defaultColDef = useMemo( ()=> ({
        resizable: true,
        editable: true,
        sortable: true,
        flex: 1
    }), []);

    // changes, needs to be state
    const [rowData, setRowData] = useState();

    // gets called once, no dependencies, loads the grid data
    useEffect( ()=> {
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then( resp => resp.json())
            .then( data => setRowData(data));
    }, []);

    return (
        <AgGridReact 

            // turn on AG Grid React UI
            reactUi="true"

            // all other properties as normal...
            className="ag-theme-alpine"
            animateRows="true"
            modules={modules}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            rowData={rowData}
        />
    );
}

render(<GridExample></GridExample>, document.querySelector('#root'));
