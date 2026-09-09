import { waitFor } from '@testing-library/dom';
import { TestGridsManager, fakeElementAttribute } from 'ag-test-utils';

import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ScrollApiModule, getGridElement } from 'ag-grid-community';
import { RichSelectModule } from 'ag-grid-enterprise';

const LANGUAGES = ['English', 'Spanish', 'French', 'Portuguese', '(other)'];

// 15 × 200px columns exceed the mocked 1000px viewport, so a far column is off-screen until editing
// scrolls it into view — guards that the Rich Select picker still opens for that scrolled-in edit.
function wideRichSelectColumns(): ColDef[] {
    return Array.from({ length: 15 }, (_, i) => ({
        field: `c${i}`,
        width: 200,
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: { values: LANGUAGES },
    }));
}

function rowData(): Record<string, string>[] {
    return [
        Object.fromEntries(wideRichSelectColumns().map((c) => [c.field!, 'English'])),
        Object.fromEntries(wideRichSelectColumns().map((c) => [c.field!, 'Spanish'])),
    ];
}

const pickerExpanded = (gridDiv: HTMLElement): boolean => !!gridDiv.querySelector('.ag-picker-expanded');

describe('Rich Select cell editor — picker opens for a scrolled-into-view edit', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [RichSelectModule, ScrollApiModule],
    });

    beforeEach(() => {
        // VirtualList skips rendering rows when the viewport height is 0 (no layout in happy-dom).
        fakeElementAttribute('offsetHeight', 100, '.ag-virtual-list-viewport');
    });

    afterEach(() => gridMgr.reset());

    const create = (): Promise<GridApi> =>
        gridMgr.createGridAndWait('rich-select-scroll', {
            columnDefs: wideRichSelectColumns(),
            rowData: rowData(),
            defaultColDef: { editable: true },
            editType: 'singleCell',
            suppressColumnVirtualisation: false,
            suppressAnimationFrame: true,
        } satisfies GridOptions);

    test('picker opens when editing starts on an off-screen column scrolled into view', async () => {
        const api = await create();
        const gridDiv = getGridElement(api)! as HTMLElement;

        // c8 sits outside the 1000px viewport; startEditingCell scrolls it into view as part of the start.
        api.startEditingCell({ rowIndex: 0, colKey: 'c8' });

        // The Rich Select picker must be shown for the freshly-started edit.
        await waitFor(() => expect(pickerExpanded(gridDiv)).toBe(true));
    });
});
