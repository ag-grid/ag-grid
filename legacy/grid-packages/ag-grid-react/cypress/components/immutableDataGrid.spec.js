// noinspection ES6UnusedImports
import React, {Component, useState} from 'react'
import {mount} from 'cypress-react-unit-test'
import {AgGridReact} from "../..";
import {ensureGridApiHasBeenSet} from "./utils";

class CellRenderer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            value: props.value
        }
    }

    refresh(newParams) {
        this.setState({value: newParams.value})
    }

    render() {
        return (
            <span>{this.state.value}</span>
        )
    }
}

const NUMBER_OF_ROWS = 3;

class GridComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnDefs: [
                {
                    field: "id",
                    sort: "desc"
                },
                {
                    field: "value",
                    cellRenderer: "cellRenderer"
                }
            ],
            rowData: this.createRowData()
        };
    }

    getRowId(params) {
        return params.data.id;
    }

    onGridReady = (params) => {
        this.api = params.api;
    }

    addNew = () => {
        const newRowData = [...this.state.rowData,
            {
                id: this.state.rowData.length,
                value: this.state.rowData.length
            }
        ];
        this.setState({rowData: newRowData})
    }

    modifyRow = () => {
        const newRowData = this.state.rowData.map(row => {
            return row.value === this.state.rowData.length - 1 ? {...row, value: `${row.value}*`} : row;
        })
        this.setState({rowData: newRowData})
    }

    createRowData() {
        const rowData = [];

        for (let i = 0; i < NUMBER_OF_ROWS; i++) {
            rowData.push({
                id: i,
                value: i
            });
        }

        return rowData;
    }

    render() {
        return (
            <div className="ag-theme-alpine" style={{height: 400, width: 600}}>
                <button className="addNewRow" onClick={this.addNew}>Add New Row</button>
                <button className="modifyRow" onClick={this.modifyRow}>Modify Row</button>
                <AgGridReact
                    ref={(element) => {
                        window.gridComponentInstance = element
                    }}
                    suppressReactUi={true}
                    columnDefs={this.state.columnDefs}
                    onGridReady={this.onGridReady}
                    rowData={this.state.rowData}
                    frameworkComponents={{
                        cellRenderer: CellRenderer
                    }}/>
            </div>
        );
    }
}

describe('Class Component Cell Renderer Immutable Data Grid', () => {
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

    it('Initial Render As Expected', () => {
        // row position (top to bottom): row value
        const EXPECTED_ROWS = {
            0: '2',
            1: '1',
            2: '0',
        }
        cy.get('div .ag-react-container')
            .should('have.length', 3)
            .each((value, index, collection) => {
                cy.wrap(value)
                    .invoke('text')
                    .then(text => expect(text).to.equal(EXPECTED_ROWS[index]))
            })
    })

    /*
    * This is testing a (previous) issue where immutable data wasn't correctly updating react renderers
    *
    * 1) Initial Render
    * 2) Add a new row
    * 3) Update the last row
    * 4) Add a new row
    *
    * The modified row should have been moved "down" when (4) is run
    *
    * So the rows after these steps should be
    * 4 (last row added)
    * 3* (first row added, then row modified)
    * 2 (initial render)
    * 1 (initial render)
    * 0 (initial render)
    */
    it('Add, Modify and Add Row Renders As Expected', () => {
        // row position (top to bottom): row value
        const EXPECTED_ROWS = {
            0: '4',
            1: '3*',
            2: '2',
            3: '1',
            4: '0',
        }
        cy.get('.addNewRow')
            .click()
            .get('.modifyRow')
            .click()
            .get('.addNewRow')
            .click()
            .get('div .ag-react-container')
            .should('have.length', 5)
            .each((value, index, collection) => {
                cy.wrap(value)
                    .invoke('text')
                    .then(text => expect(text).to.equal(EXPECTED_ROWS[index]))
            })
    })
})


