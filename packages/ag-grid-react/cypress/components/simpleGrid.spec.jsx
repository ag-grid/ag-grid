// noinspection ES6UnusedImports
import { mount } from 'cypress-react-unit-test';
import React, { useState } from 'react';

import { ClientSideRowModelModule } from 'ag-grid-community';

import { AgGridReact } from '../../lib/agGridReact';
import { ensureGridApiHasBeenSet } from './utils';

const App = () => {
    const [rowData, setRowData] = useState([
        { make: 'Toyota', model: 'Celica', price: 35000 },
        { make: 'Ford', model: 'Mondeo', price: 32000 },
        { make: 'Porsche', model: 'Boxster', price: 72000 },
    ]);

    const [colDefs, setColDefs] = useState([{ field: 'make' }, { field: 'model' }, { field: 'price' }]);

    function onGridReady(params) {}

    return (
        <div className="ag-theme-alpine" style={{ height: 400, width: 600 }}>
            <AgGridReact
                ref={(element) => {
                    window.gridComponentInstance = element;
                }}
                onGridReady={onGridReady}
                rowData={rowData}
                columnDefs={colDefs}
                suppressReactUi={true}
                modules={[ClientSideRowModelModule]}
            />
        </div>
    );
};

describe('Simple Grid', () => {
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

    it('Simple Grid Renders', () => {
        cy.contains('Toyota').should('be.visible');
        cy.contains('Ford').should('be.visible');
        cy.contains('Porsche').should('be.visible');
    });
});
