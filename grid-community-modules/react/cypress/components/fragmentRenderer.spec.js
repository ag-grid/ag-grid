// noinspection ES6UnusedImports
import React, {Component, useState} from 'react'
import {mount} from 'cypress-react-unit-test'
import {AgGridReact} from "../..";
import {ClientSideRowModelModule} from "@ag-grid-community/client-side-row-model";
import {ensureGridApiHasBeenSet} from "./utils";

class CellRenderer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            value: props.value * props.value
        }
    }

    render() {
        return (
            <>Cell: [{this.state.value}]</>
        )
    }
}

const NUMBER_OF_ROWS = 1000;

class GridComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnDefs: [
                {
                    field: "value",
                    cellRenderer: "cellRenderer"
                }
            ],
            rowData: this.createRowData()
        };
    }

    onGridReady(params) {
        this.api = params.api;
    }

    scrollToBottom = () => {
        this.api.ensureIndexVisible(100, 'top');
    }

    createRowData() {
        const rowData = [];

        for (let i = 0; i < NUMBER_OF_ROWS; i++) {
            rowData.push({
                row: "Row " + i,
                value: i
            });
        }

        return rowData;
    }

    render() {
        return (
            <div className="ag-theme-alpine" style={{height: 400, width: 600}}>
                <button className="scrollToBottom" onClick={this.scrollToBottom}>Scroll To Bottom</button>
                <AgGridReact
                    suppressReactUi={true}
                    ref={(element) => {
                        window.gridComponentInstance = element
                    }}
                    columnDefs={this.state.columnDefs}
                    onGridReady={this.onGridReady.bind(this)}
                    rowData={this.state.rowData}
                    frameworkComponents={{
                        cellRenderer: CellRenderer
                    }}
                    modules={[ClientSideRowModelModule]}/>
            </div>
        );
    }
}


describe('Class Component With Fragments Grid', () => {
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

    it('Class Component Cell Renderer With Fragment First Rows But Not Later Rows On Initial Render', () => {
        cy.contains('Cell: [0]').should('be.visible')
        cy.contains('Cell: [1]').should('be.visible')
        cy.contains('Cell: [4]').should('be.visible')

        cy.contains('Cell: [10000]').should('not.be.visible')
        cy.contains('Cell: [10201]').should('not.be.visible')
        cy.contains('Cell: [10404]').should('not.be.visible')
    })

    it('Class Component Cell Renderer With Fragment Should Render Later Rows But Not First Rows After Navigation', () => {
        cy.get('.scrollToBottom').click()
        cy.contains('Cell: [0]').should('not.be.visible')
        cy.contains('Cell: [1]').should('not.be.visible')
        cy.contains('Cell: [4]').should('not.be.visible')

        cy.contains('Cell: [10000]').should('be.visible')
        cy.contains('Cell: [10201]').should('be.visible')
        cy.contains('Cell: [10404]').should('be.visible')
    })
})
