import { waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { TestGridsManager } from 'ag-test-utils';

import type { GridApi } from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

describe('columns tool panel search', () => {
    const gridMgr = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => {
        gridMgr.reset();
    });

    async function search(root: ParentNode, text: string): Promise<void> {
        const input = root.querySelector('.ag-column-select-header-filter-wrapper input') as HTMLInputElement;
        await userEvent.clear(input);
        if (text) {
            await userEvent.type(input, text);
        }
    }

    function isNoMatchesShown(root: ParentNode): boolean {
        const el = root.querySelector('.ag-column-select-no-matches');
        return !!el && !el.classList.contains('ag-hidden');
    }

    function isListShown(root: ParentNode): boolean {
        const el = root.querySelector('.ag-column-select-virtual-list-viewport');
        return !!el && !el.classList.contains('ag-hidden');
    }

    test('a search matching no columns shows and announces "No matches", and clearing it restores the list', async () => {
        const api: GridApi = await gridMgr.createGridAndWait('columns-tool-panel-search', {
            columnDefs: [{ field: 'athlete' }, { field: 'age' }],
            rowData: [{ athlete: 'Michael Phelps', age: 23 }],
            sideBar: { toolPanels: ['columns'], defaultToolPanel: 'columns' },
        });
        const gridElement = getGridElement(api)!;
        await waitFor(() =>
            expect(gridElement.querySelector('.ag-column-select-header-filter-wrapper')).not.toBeNull()
        );
        expect(isNoMatchesShown(gridElement)).toBe(false);

        await search(gridElement, 'zzz');
        await waitFor(() => expect(isNoMatchesShown(gridElement)).toBe(true));
        expect(gridElement.querySelector('.ag-column-select-no-matches')?.textContent).toContain('No matches');
        expect(isListShown(gridElement)).toBe(false);
        await waitFor(() =>
            expect(gridElement.querySelector('.ag-aria-description-container')?.textContent).toBe('No matches')
        );

        await search(gridElement, '');
        await waitFor(() => expect(isNoMatchesShown(gridElement)).toBe(false));
        expect(isListShown(gridElement)).toBe(true);
    });
});
