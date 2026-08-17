import { waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

import type { ColDef, GridApi, HeaderValueGetterParams } from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../test-utils';

/**
 * The columns tool panel resolves each entry's display name through `headerValueGetter`, so the name
 * has to track colDef changes that reach a live column, while a user getter must not be re-run for
 * reads that cannot have changed its output (searching, and re-rendering recycled rows).
 */
describe('columns tool panel display name', () => {
    const gridMgr = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => {
        gridMgr.reset();
    });

    const sideBar = {
        toolPanels: [
            {
                id: 'columns',
                labelDefault: 'Columns',
                labelKey: 'columns',
                iconKey: 'columns',
                toolPanel: 'agColumnsToolPanel',
            },
        ],
        defaultToolPanel: 'columns',
    };

    /** jsdom gives the virtual list no height, so the viewport needs one before it renders any row. */
    function renderVirtualList(root: ParentNode): void {
        const viewport = root.querySelector('.ag-column-select-virtual-list-viewport') as HTMLElement;
        Object.defineProperty(viewport, 'offsetHeight', { value: 300, configurable: true });
        viewport.dispatchEvent(new Event('scroll'));
    }

    function labels(root: ParentNode): (string | null)[] {
        return Array.from(root.querySelectorAll('.ag-column-select-column-label'), (el) => el.textContent);
    }

    async function search(root: ParentNode, text: string): Promise<void> {
        const input = root.querySelector('.ag-column-select-header-filter-wrapper input') as HTMLInputElement;
        await userEvent.clear(input);
        if (text) {
            await userEvent.type(input, text);
        }
    }

    test('an entry re-resolves its name when the colDef changes underneath it', async () => {
        // Cell data type inference is the case that matters: it re-applies the colDef to the live
        // column once row data arrives, without reloading columns, so the panel keeps its entries.
        const api: GridApi = gridMgr.createGrid('columns-tool-panel-display-name', {
            columnDefs: [
                {
                    field: 'athlete',
                    headerValueGetter: (params) => `Athlete (${params.column?.getColDef().cellDataType})`,
                },
                { field: 'age' },
            ] satisfies ColDef[],
            sideBar,
        });
        const gridElement = getGridElement(api)!;

        await waitFor(() => {
            renderVirtualList(gridElement);
            expect(labels(gridElement)).toEqual(['Athlete (false)', 'Age']);
        });
        // Search first, so the pre-inference name is resolved for every entry before it changes.
        await search(gridElement, 'athlete');
        await waitFor(() => expect(labels(gridElement)).toEqual(['Athlete (false)']));

        api.setGridOption('rowData', [{ athlete: 'Michael Phelps', age: 23 }]);

        await waitFor(() => expect(labels(gridElement)).toEqual(['Athlete (text)']));

        await search(gridElement, 'athlete (text)');
        await waitFor(() => expect(labels(gridElement)).toEqual(['Athlete (text)']));

        await search(gridElement, 'athlete (false)');
        await waitFor(() => expect(labels(gridElement)).toEqual([]));
    });

    test('searching does not re-run a header value getter whose output cannot have changed', async () => {
        let toolPanelCalls = 0;
        const countingHeaderValueGetter = (params: HeaderValueGetterParams) => {
            if (params.location === 'columnToolPanel') {
                toolPanelCalls++;
            }
            return `Col ${params.column?.getColId()}`;
        };
        const api: GridApi = await gridMgr.createGridAndWait('columns-tool-panel-display-name', {
            columnDefs: Array.from({ length: 40 }, (_, i) => ({
                field: `field${i}`,
                headerValueGetter: countingHeaderValueGetter,
            })) satisfies ColDef[],
            rowData: [{ field0: 'a' }],
            sideBar,
        });
        const gridElement = getGridElement(api)!;

        await waitFor(() => {
            renderVirtualList(gridElement);
            expect(labels(gridElement).length).toBeGreaterThan(0);
        });

        // Every entry is resolved by this first search, which has to test all 40 names.
        await search(gridElement, 'field39');
        await waitFor(() => expect(labels(gridElement)).toEqual(['Col field39']));
        const callsAfterFirstSearch = toolPanelCalls;
        expect(callsAfterFirstSearch).toBeGreaterThanOrEqual(40);

        // Further searches re-test all 40 names and re-render rows, but nothing that feeds a name
        // has changed, so no entry may consult the getter again.
        await search(gridElement, 'field38');
        await waitFor(() => expect(labels(gridElement)).toEqual(['Col field38']));
        await search(gridElement, '');
        await waitFor(() => expect(labels(gridElement).length).toBeGreaterThan(1));

        expect(toolPanelCalls).toBe(callsAfterFirstSearch);
    });

    test('reverting a renamed column consults its header value getter again', async () => {
        let toolPanelCalls = 0;
        const api: GridApi = await gridMgr.createGridAndWait('columns-tool-panel-display-name', {
            columnDefs: [
                {
                    field: 'athlete',
                    headerValueGetter: (params: HeaderValueGetterParams) => {
                        if (params.location === 'columnToolPanel') {
                            toolPanelCalls++;
                        }
                        return 'From Getter';
                    },
                },
                { field: 'age' },
            ] satisfies ColDef[],
            rowData: [{ athlete: 'Michael Phelps', age: 23 }],
            sideBar,
        });
        const gridElement = getGridElement(api)!;

        await waitFor(() => {
            renderVirtualList(gridElement);
            expect(labels(gridElement)).toEqual(['From Getter', 'Age']);
        });

        // An override wins outright over the getter, so renaming must not consult it at all.
        const callsBeforeRename = toolPanelCalls;
        api.applyColumnState({ state: [{ colId: 'athlete', headerName: 'Renamed' }] });
        await waitFor(() => expect(labels(gridElement)).toEqual(['Renamed', 'Age']));
        await search(gridElement, 'renamed');
        await waitFor(() => expect(labels(gridElement)).toEqual(['Renamed']));
        expect(toolPanelCalls).toBe(callsBeforeRename);

        // Reverting drops the override, so the name has to come from the getter again. The visible
        // rows refresh in place; which rows the active search admits is only recomputed on the next
        // search, so the reverted entry is still listed here under the stale "renamed" text.
        api.applyColumnState({ state: [{ colId: 'athlete', headerName: null }] });
        await waitFor(() => expect(labels(gridElement)).toEqual(['From Getter']));
        expect(toolPanelCalls).toBeGreaterThan(callsBeforeRename);

        await search(gridElement, 'from getter');
        await waitFor(() => expect(labels(gridElement)).toEqual(['From Getter']));
    });
});
