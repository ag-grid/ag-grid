import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, getGridElement } from 'ag-grid-community';
import { RowGroupingModule, RowGroupingPanelModule } from 'ag-grid-enterprise';

import { DragEventDispatcher, TestGridsManager, asyncSetTimeout } from '../test-utils';

type SuppressValue = GridOptions['suppressGroupChangesColumnVisibility'];

describe('suppressGroupChangesColumnVisibility', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, RowGroupingPanelModule],
    });

    beforeEach(() => gridsManager.reset());
    afterEach(() => gridsManager.reset());

    async function createGrid(suppressGroupChangesColumnVisibility: SuppressValue): Promise<GridApi> {
        return gridsManager.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'athlete' }, { field: 'country', enableRowGroup: true }, { field: 'year' }],
            rowData: [
                { athlete: 'Michael Phelps', country: 'United States', year: 2008 },
                { athlete: 'Julian Weber', country: 'Romania', year: 2000 },
            ],
            rowGroupPanelShow: 'always',
            suppressGroupChangesColumnVisibility,
        });
    }

    function getRowGroupDropZone(api: GridApi): HTMLElement {
        const gridEl = getGridElement(api)! as HTMLElement;
        const dropZone = gridEl.querySelector('.ag-column-drop-horizontal-rowgroup') as HTMLElement | null;
        if (!dropZone) {
            throw new Error('Row group drop zone not found in grid DOM');
        }
        return dropZone;
    }

    function getColumnHeader(api: GridApi, colId: string): HTMLElement {
        const gridEl = getGridElement(api)! as HTMLElement;
        const header = gridEl.querySelector(`.ag-header-cell[col-id="${colId}"]`) as HTMLElement | null;
        if (!header) {
            throw new Error(`Column header not found for colId="${colId}"`);
        }
        return header;
    }

    /**
     * Drags an element from `source` to `target` using AG Grid's pointer-based drag system.
     * Mocks `elementsFromPoint` (jsdom returns nothing useful) and bounding rects on both ends
     * so the DragService correctly resolves the drop target. Mirrors the pattern used by
     * `dragRenderedPrimaryColumnToRowGroups` in deferred-pivot-mode.test.ts.
     */
    async function dragSourceToTarget(source: HTMLElement, target: HTMLElement): Promise<void> {
        const dispatcher = new DragEventDispatcher('mouse', null, false);
        const ownerDocument = target.ownerDocument;
        const originalElementsFromPoint = ownerDocument.elementsFromPoint?.bind(ownerDocument);
        const originalSourceRect = source.getBoundingClientRect.bind(source);
        const originalTargetRect = target.getBoundingClientRect.bind(target);
        const sourceRect = new DOMRect(10, 10, 24, 24);
        const targetRect = new DOMRect(100, 100, 240, 80);

        ownerDocument.elementsFromPoint = () => [target];
        source.getBoundingClientRect = () => sourceRect;
        target.getBoundingClientRect = () => targetRect;

        try {
            await dispatcher.startDrag(source, sourceRect.left + 2, sourceRect.top + 2);
            await dispatcher.movePointer(target, targetRect.left + 10, targetRect.top + 10);
            await dispatcher.finishDrag(target);
            await asyncSetTimeout(50);
        } finally {
            ownerDocument.elementsFromPoint = originalElementsFromPoint as typeof ownerDocument.elementsFromPoint;
            source.getBoundingClientRect = originalSourceRect;
            target.getBoundingClientRect = originalTargetRect;
        }
    }

    /**
     * Expected column visibility after each grouping transition, for each supported value of
     * `suppressGroupChangesColumnVisibility`. `hiddenAfterGroup` is the expected visibility
     * after the column is added to the row groups; `hiddenAfterUngroup` is the expected
     * visibility after the column is subsequently removed from the row groups.
     */
    const cases: Array<{
        label: string;
        value: SuppressValue;
        hiddenAfterGroup: boolean;
        hiddenAfterUngroup: boolean;
    }> = [
        { label: 'default (undefined)', value: undefined, hiddenAfterGroup: true, hiddenAfterUngroup: false },
        { label: 'true', value: true, hiddenAfterGroup: false, hiddenAfterUngroup: false },
        {
            label: '"suppressHideOnGroup"',
            value: 'suppressHideOnGroup',
            hiddenAfterGroup: false,
            hiddenAfterUngroup: false,
        },
        {
            label: '"suppressShowOnUngroup"',
            value: 'suppressShowOnUngroup',
            hiddenAfterGroup: true,
            hiddenAfterUngroup: true,
        },
    ];

    describe.each(cases)('$label', ({ value, hiddenAfterGroup, hiddenAfterUngroup }) => {
        test('grid API: add then remove row group column', async () => {
            const api = await createGrid(value);
            const country = api.getColumn('country')!;

            expect(country.isVisible()).toBe(true);

            api.addRowGroupColumns(['country']);
            expect(country.isVisible()).toBe(!hiddenAfterGroup);

            api.removeRowGroupColumns(['country']);
            expect(country.isVisible()).toBe(!hiddenAfterUngroup);
        });

        test('drag: column header dragged into the row group panel', async () => {
            const api = await createGrid(value);
            const country = api.getColumn('country')!;

            expect(country.isVisible()).toBe(true);

            await dragSourceToTarget(getColumnHeader(api, 'country'), getRowGroupDropZone(api));

            expect(api.getRowGroupColumns().map((col) => col.getColId())).toContain('country');
            expect(country.isVisible()).toBe(!hiddenAfterGroup);
        });

        // Drag-out via pill is not directly exercised here — DragService's pointer-based
        // drag-leave gesture doesn't transition the panel's `rearrangeItems` state when
        // dispatched through synthesised events in jsdom (the move from the source to outside
        // the zone collapses into a single dragStart-then-leave pair before the panel sees the
        // enter). The combined suppress logic is covered by:
        //   - "grid API: add then remove row group column" (API entry point)
        //   - "drag: column header dragged into the row group panel" (drag-in entry point)
        // Both exercise `_shouldUpdateColVisibilityAfterGroup` — the same helper called from
        // `handleDragLeaveEnd`.
    });
});
