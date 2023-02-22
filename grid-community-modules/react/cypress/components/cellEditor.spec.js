// noinspection ES6UnusedImports
import React, {Component, forwardRef, useImperativeHandle, useState} from 'react'
import {mount} from 'cypress-react-unit-test'
import { AgGridReact } from "../..";
import {ClientSideRowModelModule} from "@ag-grid-community/client-side-row-model";
import {ensureGridApiHasBeenSet} from "./utils";

const CellEditor = forwardRef((props, ref) => {
    const [value, setValue] = useState(props.value);

    useImperativeHandle(ref, () => {
        return {
            isPopup() {
                return true;
            },

            afterGuiAttached() {
            },

            getValue() {
                return value;
            },

            isCancelBeforeStart() {
                return false;
            },

            isCancelAfterEnd() {
                return false;
            }
        }
    });

    function incrementValue() {
        setValue(value + 1);
    }

    function close() {
        props.stopEditing();
    }

    return (
        <div>
            <button className="increment" onClick={() => incrementValue()}>Increment</button>
            <button className="close" onClick={() => close()}>Close</button>
            {value}
        </div>

    );
});

const GridComponent = () => {
    const [rowData, setRowData] = useState([
        {value: 1}
    ]);
    const [colDefs, setColDefs] = useState([
        { field: 'value', editable: true, cellEditorComp: 'cellEditor' }
    ]);


    return (
        <div style={{height: 400, width: 900, marginTop: 15}}
             className="ag-theme-alpine">
            <AgGridReact
                suppressReactUi={true}
                ref={(element) => {
                    window.gridComponentInstance = element
                }}
                comps={{
                    cellEditor: CellEditor
                }}
                rowData={rowData}
                columnDefs={colDefs}
                modules={[ClientSideRowModelModule]}>

            </AgGridReact>
        </div>
    )
}


describe('Cell Editor', () => {
    beforeEach((done) => {
        window.gridComponentInstance = null;

        mount(<GridComponent/>, {
            stylesheets: [
                'https://cdn.jsdelivr.net/npm/@ag-grid-community/styles/ag-grid.css',
                'https://cdn.jsdelivr.net/npm/@ag-grid-community/styles/ag-theme-alpine.css'
            ]
        })

        ensureGridApiHasBeenSet().then(() => setTimeout(() => done(), 20), () => throw new Error("Grid API not set within expected time limits"));
    });
    afterEach(() => {
        window.gridComponentInstance = null;
    });

    it('Invoking a Cell Editor and Commiting a Change Updates Row Data', () => {
        /* this test:
         * 1) checks the cell value
         * 2) dbl clicks the cell to open the editor
         * 1) clicks the increment button
         * 1) clicks the close button
         * 1) checks the cell value has been updated
         */
        cy.wait(50)
            .get('.ag-cell-value')
            .first()
            .invoke('text')
            .should(text => {
                // console.log(`[${text}]`);
                expect(text).to.equal('1')
            })
            .get('.ag-cell-value')
            .dblclick()
            .wait(500)
            .get('.increment')
            .click()
            .get('.close')
            .click()
            .get('.ag-cell-value')
            .first()
            .invoke('text')
            .should(text => {
                expect(text).to.equal('2')
            })
    })
})
