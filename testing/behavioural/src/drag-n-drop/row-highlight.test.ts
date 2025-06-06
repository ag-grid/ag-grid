import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, RowHighlightModule } from 'ag-grid-community';

import { TestGridsManager } from '../test-utils';

describe('ag-grid row highlight', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowHighlightModule],
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

        // Initial state
        expect(api.getHighlightedRow()).toBeUndefined();
        expect(getElementHighlight(element)).toEqual({ id: undefined, position: 'none' });

        api.setHighlightedRow(null, null);
        expect(api.getHighlightedRow()).toBeUndefined();
        expect(getElementHighlight(element)).toEqual({ id: undefined, position: 'none' });

        api.setHighlightedRow(null, 'below');
        expect(api.getHighlightedRow()).toBeUndefined();
        expect(getElementHighlight(element)).toEqual({ id: undefined, position: 'none' });

        const node1 = api.getRowNode('1')!;
        const node2 = api.getRowNode('2')!;
        const node3 = api.getRowNode('3')!;

        api.setHighlightedRow(node1, false);
        expect(api.getHighlightedRow()?.id).toBeUndefined();
        expect(getElementHighlight(element)).toEqual({ id: undefined, position: 'none' });

        api.setHighlightedRow(node1, 'none');
        expect(api.getHighlightedRow()?.id).toBeUndefined();
        expect(getElementHighlight(element)).toEqual({ id: undefined, position: 'none' });

        api.setHighlightedRow('1', null);
        expect(api.getHighlightedRow()?.id).toBeUndefined();
        expect(getElementHighlight(element)).toEqual({ id: undefined, position: 'none' });

        api.setHighlightedRow(node1, 'below');
        expect(api.getHighlightedRow()?.id).toBe(node1.id);
        expect(getElementHighlight(element)).toEqual({ id: node1.id, position: 'below' });

        api.setHighlightedRow(node1, 'above');
        expect(api.getHighlightedRow()?.id).toBe(node1.id);
        expect(getElementHighlight(element)).toEqual({ id: node1.id, position: 'above' });

        api.setHighlightedRow(node2, 'below');
        expect(api.getHighlightedRow()?.id).toBe(node2.id);
        expect(getElementHighlight(element)).toEqual({ id: node2.id, position: 'below' });

        api.setHighlightedRow('1', 'below');
        expect(api.getHighlightedRow()?.id).toBe(node1.id);
        expect(getElementHighlight(element)).toEqual({ id: node1.id, position: 'below' });

        api.setHighlightedRow('3', 'none');
        expect(api.getHighlightedRow()?.id).toBeUndefined();
        expect(getElementHighlight(element)).toEqual({ id: undefined, position: 'none' });

        api.setHighlightedRow('3', 'below');
        expect(api.getHighlightedRow()?.id).toBe(node3.id);
        expect(getElementHighlight(element)).toEqual({ id: node3.id, position: 'below' });

        // Remove the highlighted node
        api.setGridOption(
            'rowData',
            rowData.filter((data) => data.id !== '3')
        );

        expect(api.getHighlightedRow()?.id).toBeUndefined();
        expect(getElementHighlight(element)).toEqual({ id: undefined, position: 'none' });

        api.setHighlightedRow(node3, 'below');
        expect(node3.rowIndex).toBeNull();
        expect(api.getHighlightedRow()?.id).toBeUndefined();
        expect(getElementHighlight(element)).toEqual({ id: undefined, position: 'none' });
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
