// noinspection ES6UnusedImports
import { mount } from 'cypress-react-unit-test';
import React, { useState } from 'react';

import { ClientSideRowModelModule } from 'ag-grid-community';

import { AgGridReact } from '../../lib/agGridReact';
import { ensureGridApiHasBeenSet } from './utils';

const CellRenderer = (props) => <>{props.value}</>;

const App = () => {
    const [rowData, setRowData] = useState([
        {
            value: 10,
        },
        {
            value: null,
        },
    ]);
    const [colDefs, setColDefs] = useState([{ field: 'value', cellRendererComp: 'cellRenderer' }]);
    function onGridReady(params) {}

    return (
        <div className="ag-theme-alpine" style={{ height: 400, width: 600 }}>
            <AgGridReact
                ref={(element) => {
                    window.gridComponentInstance = element;
                }}
                suppressReactUi={true}
                onGridReady={onGridReady}
                rowData={rowData}
                columnDefs={colDefs}
                comps={{
                    cellRenderer: CellRenderer,
                }}
                modules={[ClientSideRowModelModule]}
            />
        </div>
    );
};

describe('Grid With Null Values', () => {
    beforeEach((done) => {
        window.gridComponentInstance = null;

        mount(<App />, {
            stylesheets: [
                'https://cdn.jsdelivr.net/npm/ag-grid-community/styles/ag-grid.css',
                'https://cdn.jsdelivr.net/npm/ag-grid-community/styles/ag-theme-alpine.css',
            ],
        });

        ensureGridApiHasBeenSet().then(
            () => setTimeout(() => done(), 20),
            () => {
                throw new Error('Grid API not set within expected time limits');
            }
        );
    });
    afterEach(() => {
        window.gridComponentInstance = null;
    });

    it('Null and Non-Null Values Render As Expected', () => {
        // row position (top to bottom): row value
        const EXPECTED_ROWS = {
            0: '10',
            1: '',
        };
        cy.get('div .ag-react-container')
            .should('have.length', 2)
            .each((value, index, collection) => {
                cy.wrap(value)
                    .invoke('text')
                    .then((text) => expect(text).to.equal(EXPECTED_ROWS[index]));
            });
    });
});
