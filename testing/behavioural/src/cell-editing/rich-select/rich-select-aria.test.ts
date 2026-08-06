import { waitFor } from '@testing-library/dom';

import { getGridElement } from 'ag-grid-community';
import type { GridApi, GridOptions } from 'ag-grid-community';
import { RichSelectModule } from 'ag-grid-enterprise';

import { TestGridsManager, fakeElementAttribute, firePointerLikeClick, waitForPopup } from '../../test-utils';

/**
 * The Rich Select combobox must not carry a dangling `aria-controls` idref (WCAG 4.1.2). The list is
 * popup-mounted, so `aria-controls` is gated on the expand state: absent while collapsed, set to the
 * present list while expanded. `getAriaElement()` is the wrapper by default and the input when
 * `allowTyping`, so both element targets are covered.
 */
describe('Rich Select combobox aria-controls (WCAG 4.1.2)', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [RichSelectModule],
    });

    beforeEach(() => {
        // VirtualList skips rendering rows when the viewport height is 0 (no layout in jsdom).
        fakeElementAttribute('offsetHeight', 100, '.ag-virtual-list-viewport');
    });

    afterEach(() => gridMgr.reset());

    const createGrid = (allowTyping: boolean): Promise<GridApi> =>
        gridMgr.createGridAndWait('grid', {
            columnDefs: [
                {
                    field: 'a',
                    editable: true,
                    cellEditor: 'agRichSelectCellEditor',
                    cellEditorParams: { values: ['Alpha', 'Beta', 'Gamma'], allowTyping },
                },
            ],
            rowData: [{ id: '0', a: 'Alpha' }],
            getRowId: (p) => p.data.id,
        } as GridOptions);

    test.each([
        ['default (wrapper)', false],
        ['allowTyping (input)', true],
    ])('%s: aria-controls references the list only while the picker is expanded', async (_label, allowTyping) => {
        const api = await createGrid(allowTyping as boolean);
        const gridDiv = getGridElement(api)! as HTMLElement;

        // The picker opens with the editor; its aria element (wrapper or input) carries aria-expanded.
        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        await waitForPopup(gridDiv);

        const ariaEl = await waitFor(() => {
            const el = gridDiv.querySelector<HTMLElement>('[aria-expanded="true"]');
            if (!el) {
                throw new Error('No expanded combobox element found');
            }
            return el;
        });
        const controlsId = ariaEl.getAttribute('aria-controls');
        expect(controlsId).toBeTruthy();
        expect(document.getElementById(controlsId!)).not.toBeNull();

        // Collapse: the list leaves the DOM, so aria-controls must be dropped in step with
        // aria-expanded, leaving no dangling idref (WCAG 4.1.2).
        const wrapper = gridDiv.querySelector<HTMLElement>('.ag-picker-field-wrapper')!;
        await firePointerLikeClick(wrapper);

        expect(gridDiv.contains(ariaEl)).toBe(true);
        await waitFor(() => expect(ariaEl.getAttribute('aria-expanded')).toBe('false'));
        expect(ariaEl.getAttribute('aria-controls')).toBeNull();
        expect(document.getElementById(controlsId!)).toBeNull();
    });
});
