/*
 * Issue: a custom icon function in `gridOptions.icons` that returns something unusable (an object or
 * undefined, neither a string nor a DOM node) makes the grid log warning #133 and then crash with a raw
 * `TypeError: Failed to execute 'appendChild' on 'Node'`.
 *
 * Setup: two columns and `icons: { columnMoveMove: () => ({}) }`; the icon is created when a column header
 * drag starts (the drag ghost shows `columnMoveMove`).
 *
 * Expected: invalid custom icons are documented as producing a warning (#133, "iconRenderer should return
 * back a string or a DOM object"), not a crash, so the grid should still be created and the header rendered.
 * Valid icon strings and elements work (the control test below).
 *
 * Actual: `_createIconNoSpan` (utils/icon.ts) warns #133 and returns undefined, then `_createIcon` calls
 * `eResult.appendChild(undefined)`, which throws.
 *
 * Reported on grid version: react 35.1.0.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). A coding agent on React 35.1.0 searched, in May
 * 2026, "gridOptions icons custom SVG string HTML element appendChild error".
 */
import { DragEventDispatcher, TestGridsManager } from 'ag-test-utils';
import type { MockInstance } from 'vitest';

import { ClientSideRowModelModule, ValidationModule, enableDevValidations } from 'ag-grid-community';

describe('custom icon returning an unusable value', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, ValidationModule] });
    let consoleWarnSpy: MockInstance;

    beforeEach(() => {
        enableDevValidations({ throwOn: [] });
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
        consoleWarnSpy.mockRestore();
    });

    const dragHeader = async (whileDragging?: () => void): Promise<void> => {
        const header = document.querySelector<HTMLElement>('.ag-header-cell[col-id="a"]')!;
        const target = document.querySelector<HTMLElement>('.ag-header-cell[col-id="b"]')!;
        const dispatcher = new DragEventDispatcher('mouse');
        await dispatcher.startDrag(header, 100, 10);
        await dispatcher.movePointer(target, 300, 10);
        whileDragging?.();
        await dispatcher.finishDrag();
    };

    const warnings = () => consoleWarnSpy.mock.calls.map((args) => args.join(' ')).join('\n');

    const options = (icons: Record<string, () => any>) => ({
        columnDefs: [{ field: 'a' }, { field: 'b' }],
        rowData: [{ a: 1, b: 2 }],
        icons,
    });

    test('control: a function returning an SVG string is shown in the drag ghost', async () => {
        gridsManager.createGrid('icon-valid', options({ columnMoveHide: () => '<svg class="my-icon"></svg>' }));
        let iconInDom = false;
        await dragHeader(() => {
            iconInDom = !!document.querySelector('.my-icon');
        });
        expect(iconInDom).toBe(true);
        expect(warnings()).not.toContain('133');
    });

    test('a function returning an object does not throw when a column drag starts', async () => {
        gridsManager.createGrid('icon-invalid', options({ columnMoveMove: () => ({}) }));
        await expect(dragHeader()).resolves.toBeUndefined();
        expect(warnings()).toContain('133');
    });
});
