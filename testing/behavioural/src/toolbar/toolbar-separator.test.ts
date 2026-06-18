import { ClientSideRowModelModule, QuickFilterModule } from 'ag-grid-community';
import { FindModule, ToolbarModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, waitForEvent } from '../test-utils';

describe('Toolbar separator item', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, FindModule, QuickFilterModule, ToolbarModule],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test('renders separator elements between items', async () => {
        const api = gridMgr.createGrid('separator-render', {
            columnDefs: [{ field: 'name' }],
            rowData: [{ name: 'Alice' }],
            toolbar: {
                items: ['agFindToolbarItem', 'separator', 'agQuickFilterToolbarItem'],
            },
        });
        await new GridColumns(api, `renders separator elements between items setup`).checkColumns(`
            CENTER
            └── name "Name" width:200
        `);
        await new GridRows(api, `renders separator elements between items setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Alice"
        `);

        await waitForEvent('firstDataRendered', api);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const toolbar = gridDiv.querySelector('.ag-toolbar')!;
        const separators = toolbar.querySelectorAll('.ag-toolbar-separator');
        expect(separators).toHaveLength(1);
        expect(separators[0].getAttribute('role')).toBe('separator');
        await new GridRows(api, `renders separator elements between items final state`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Alice"
        `);
    });
});
