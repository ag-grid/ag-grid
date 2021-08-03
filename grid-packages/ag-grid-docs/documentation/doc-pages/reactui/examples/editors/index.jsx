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

const MyEditor = memo(forwardRef((props, ref) => {

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
        if (event.keyCode==13) {
            props.stopEditing();
        }
    }, []);

    useEffect( ()=> refInput.current.focus(), []);

    return (
        <input type="number" className="my-react-editor"
               ref={refInput}
               value={value}
               onChange={onChangeListener}
               onKeyDown={onKeyDownListener}
        />
    );
 }));

 function GridExample() {

    // never changes, so we can use useMemo
    const modules = useMemo( ()=> [ClientSideRowModelModule, RangeSelectionModule, RowGroupingModule, RichSelectModule], []);

    // never changes, so we can use useMemo
    const columnDefs = useMemo( ()=> [
        {
            headerName: 'JS Inline',
            field: 'athlete',
            editable: true
        },
        {
            headerName: 'JS Popup',
            field: 'athlete',
            editable: true,
            cellEditor: 'agRichSelect',
            cellEditorParams: {
                values: ['Michael Phelps', 'Natalie Coughlin', 'Aleksey Nemov', 'Alicia Coutts', 'Missy Franklin', 'Ryan Lochte', 'Allison Schmitt', 'Ian Thorpe', 'Dara Torres', 'Cindy Klassen', 'Nastia Liukin', 'Marit Bjørgen', 'Sun Yang', 'Kirsty Coventry', 'Libby Lenton-Trickett']
            },
            cellEditorPopup: true
        },
        {
            headerName: 'React Inline',
            field: 'age',
            editable: true,
            cellEditorFramework: MyEditor
        },
        {
            field: 'age',
            headerName: 'React Popup',
            cellEditorFramework: MyEditor,
            cellEditorPopup: true,
            cellEditorPopupPosition: 'under'
        }
    ], []);

    // never changes, so we can use useMemo
    const defaultColDef = useMemo( ()=> ({
        resizable: true,
        editable: true,
        sortable: true
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
