import '@testing-library/jest-dom';

import type { ColDef, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, createGrid } from 'ag-grid-community';

const data = [{ a: 1, b: 10, c: 100 }];
const columns: ColDef[] = [
    {
        field: 'a',
    },
    {
        field: 'b',
        headerName: 'ColumnB',
    },
    {
        field: 'c',
        headerComponentParams: {
            // validate templates with no data-ref are rendered
            template: `<div>Hello</div>`,
        },
    },
    {
        field: 'c',
        headerName: 'C_Template',
        headerComponentParams: {
            // validate templates with no data-ref are rendered
            template: `<div data-ref="eText"></div>`,
        },
    },
];

test('Headers Rendered', async () => {
    const gridOptions: GridOptions = {
        columnDefs: columns,
        rowData: data,
    };

    const eGridDiv = document.createElement('div');

    createGrid(eGridDiv, gridOptions, { modules: [ClientSideRowModelModule] });

    const headers = eGridDiv.querySelectorAll('.ag-header-cell-comp-wrapper')!;

    expect(headers.length).toBe(4);
    expect(headers[0].textContent?.trim()).toBe('A');
    expect(headers[1].textContent?.trim()).toBe('ColumnB');
    expect(headers[2].textContent?.trim()).toBe('Hello');
    expect(headers[3].textContent?.trim()).toBe('C_Template');
});
