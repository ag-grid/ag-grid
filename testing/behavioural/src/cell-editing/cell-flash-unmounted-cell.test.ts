import { HighlightChangesModule } from 'ag-grid-community';

import { TestGridsManager } from '../test-utils';

describe('flashCells on a cell with no rendered comp', () => {
    const gridMgr = new TestGridsManager({
        modules: [HighlightChangesModule],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test('does not throw when a targeted cell control has no comp/eGui', async () => {
        const api = await gridMgr.createGridAndWait('flashUnmountedCell', {
            columnDefs: [{ field: 'make' }],
            rowData: [{ id: 'ROW_0', make: 'Toyota' }],
            getRowId: (params) => params.data.id,
        });

        const beans = (api.getRowNode('ROW_0') as any)?.beans;
        const cellCtrls = beans.rowRenderer.getCellCtrls();
        expect(cellCtrls.length).toBeGreaterThan(0);

        // Model the pre-mount / torn-down state getCellCtrls legitimately returns: comp/eGui unset.
        for (const cellCtrl of cellCtrls) {
            cellCtrl.comp = undefined;
            cellCtrl.eGui = undefined;
        }

        expect(() => api.flashCells({ rowNodes: [api.getRowNode('ROW_0')!] })).not.toThrow();
    });
});
