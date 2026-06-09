import type { ColDef } from 'ag-grid-community';
import { ClientSideRowModelModule, KeyCode, getGridElement } from 'ag-grid-community';

import { TestGridsManager } from '../test-utils';

interface RowData {
    make: string;
    model: string;
    price: number;
    electric: boolean;
}

const columnDefs: ColDef<RowData>[] = [
    { field: 'make' },
    { field: 'model' },
    { field: 'price' },
    { field: 'electric' },
];

describe('suppressHeaderFocus tab navigation', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    function testTabOnHeaderRow(gridOptions: Parameters<typeof gridsManager.createGrid>[1]) {
        const host = document.createElement('div');
        const aboveInput = document.createElement('input');
        const gridDiv = document.createElement('div');
        const belowInput = document.createElement('input');
        host.append(aboveInput, gridDiv, belowInput);
        document.body.appendChild(host);

        const errors: ErrorEvent[] = [];
        const onError = (e: ErrorEvent) => errors.push(e);
        window.addEventListener('error', onError);

        try {
            const api = gridsManager.createGrid(gridDiv, gridOptions);

            const gridElement = getGridElement(api) as HTMLElement;
            const headerRow = gridElement.querySelector<HTMLElement>('.ag-header-row')!;

            expect(headerRow).toBeTruthy();
            expect(headerRow.hasAttribute('tabindex')).toBe(false);

            headerRow.focus();
            headerRow.dispatchEvent(
                new KeyboardEvent('keydown', { key: KeyCode.TAB, bubbles: true, cancelable: true })
            );

            expect(errors).toHaveLength(0);
        } finally {
            window.removeEventListener('error', onError);
            host.remove();
        }
    }

    test('tabbing on header row with suppressHeaderFocus and empty rowData does not throw', () => {
        testTabOnHeaderRow({
            columnDefs,
            rowData: [],
            defaultColDef: { flex: 1 },
            suppressHeaderFocus: true,
        });
    });

    test('tabbing on header row with suppressHeaderFocus and suppressCellFocus does not throw', () => {
        testTabOnHeaderRow({
            columnDefs,
            rowData: [{ make: 'test' }],
            defaultColDef: { flex: 1 },
            suppressHeaderFocus: true,
            suppressCellFocus: true,
        });
    });
});
