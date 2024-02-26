import { getByText } from '@testing-library/dom';
import '@testing-library/jest-dom';

import { createGrid, GridOptions } from 'ag-grid-community';

function createAgGrid() {
    const div = document.createElement('div');

    const gridOptions: GridOptions = {
        columnDefs: [
            { headerName: 'Make', field: 'make' },
            { headerName: 'Model', field: 'model' },
            { field: 'price', valueFormatter: (params) => '$' + params.value.toLocaleString() },
        ],
        rowData: [
            { make: 'Toyota', model: 'Celica', price: 35000 },
            { make: 'Ford', model: 'Mondeo', price: 32000 },
            { make: 'Porsche', model: 'Boxster', price: 72000 },
        ],
    };

    const api = createGrid(div, gridOptions);

    return { div, api };
}

test('examples of some things', async () => {
    const { div, api } = createAgGrid();

    // Get a cell value
    expect(getByText(div, 'Ford')).toHaveTextContent('Ford');

    // Test the value formatter by searching for the correct price string
    expect(getByText(div, '$72,000')).toBeDefined();

    // Test via the api even though this is not a recommended approach
    expect(api.getDisplayedRowCount()).toBe(3);
});
