import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, RowDragModule } from 'ag-grid-community';

import { TestGridsManager } from '../test-utils';

describe('ag-grid row highlight', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowDragModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('row highlight', async () => {
        const rowData = [
            { id: '1', country: 'Ireland', year: '2000', sport: 'Sailing', athlete: 'John Von Neumann' },
            { id: '2', country: 'Ireland', year: '2000', sport: 'Soccer', athlete: 'Ada Lovelace' },
            { id: '3', country: 'Ireland', year: '2001', sport: 'Football', athlete: 'Alan Turing' },
            { id: '4', country: 'Italy', year: '2000', sport: 'Soccer', athlete: 'Donald Knuth' },
            { id: '5', country: 'Italy', year: '2001', sport: 'Football', athlete: 'Marvin Minsky' },
        ];

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'country' }, { field: 'year' }, { field: 'athlete' }],
            rowData,
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);
        const element = TestGridsManager.getHTMLElement(api)!;

        const getRowHighlight = () => {
            const { row, position } = api.getRowDropHighlight();
            return { id: row?.id, position };
        };

        const node1 = api.getRowNode('1')!;
        const node2 = api.getRowNode('2')!;
        const node3 = api.getRowNode('3')!;

        // Initial state
        expect(getRowHighlight()).toEqual({ id: undefined, position: 'none' });
        expect(getElementHighlight(element)).toEqual({ id: undefined, position: 'none' });

        // Null or undefined params

        api.setRowDropHighlight(null);
        expect(getRowHighlight()).toEqual({ id: undefined, position: 'none' });
        expect(getElementHighlight(element)).toEqual({ id: undefined, position: 'none' });

        api.setRowDropHighlight(undefined);
        expect(getRowHighlight()).toEqual({ id: undefined, position: 'none' });
        expect(getElementHighlight(element)).toEqual({ id: undefined, position: 'none' });

        // clear

        for (const position of ['none', 'above', 'below'] as const) {
            api.setRowDropHighlight({ row: null, position });
            expect(getRowHighlight()).toEqual({ id: undefined, position: 'none' });
            expect(getElementHighlight(element)).toEqual({ id: undefined, position: 'none' });
        }

        // set

        api.setRowDropHighlight({ row: node1, position: 'above' });
        expect(getRowHighlight()).toEqual({ id: '1', position: 'above' });
        expect(getElementHighlight(element)).toEqual({ id: '1', position: 'above' });

        api.setRowDropHighlight({ row: node1, position: 'below' });
        expect(getRowHighlight()).toEqual({ id: '1', position: 'below' });
        expect(getElementHighlight(element)).toEqual({ id: '1', position: 'below' });

        api.setRowDropHighlight({ row: node2, position: 'below' });
        expect(getRowHighlight()).toEqual({ id: '2', position: 'below' });
        expect(getElementHighlight(element)).toEqual({ id: '2', position: 'below' });

        api.setRowDropHighlight({ row: node3, position: 'above' });
        expect(getRowHighlight()).toEqual({ id: '3', position: 'above' });
        expect(getElementHighlight(element)).toEqual({ id: '3', position: 'above' });

        // remove the highlighted node

        api.setGridOption(
            'rowData',
            rowData.filter((data) => data.id !== '3')
        );

        expect(node3.rowIndex).toBeNull();
        expect(getRowHighlight()).toEqual({ id: undefined, position: 'none' });
        expect(getElementHighlight(element)).toEqual({ id: undefined, position: 'none' });

        api.setRowDropHighlight({ row: node3, position: 'below' });
        expect(getRowHighlight()).toEqual({ id: undefined, position: 'none' });
        expect(getElementHighlight(element)).toEqual({ id: undefined, position: 'none' });

        // set and clear

        for (const position of ['none', 'above', 'below'] as const) {
            api.setRowDropHighlight({ row: node1, position: 'below' });
            api.setRowDropHighlight({ row: null, position });
            expect(getRowHighlight()).toEqual({ id: undefined, position: 'none' });
            expect(getElementHighlight(element)).toEqual({ id: undefined, position: 'none' });
        }
    });
});

function getElementHighlight(element: HTMLElement) {
    const above = element.querySelector('.ag-row-highlight-above');
    const below = element.querySelector('.ag-row-highlight-below');
    expect(!!(above && below)).toBe(false); // There cannot be both above and below highlights at the same time
    return {
        id: (above || below)?.getAttribute('row-id'),
        position: above ? 'above' : below ? 'below' : 'none',
    };
}
