import { act, cleanup, findByText, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
    dispatchGridSizeChanged,
    getRevealedElements,
    installFocusScroll,
    mockGridLayout,
    polyfillOffsetParent,
} from 'ag-test-utils';
import React from 'react';
import { onTestFinished } from 'vitest';

import type { ColDef, ColGroupDef, GridApi } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

// With scroll events as late as a browser's, React mounts the moved group's header after the menu focuses it, so the
// focus is replayed on mount.
describe('column movement menu actions (react)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([AllEnterpriseModule]);
        mockGridLayout.init();
    });

    afterEach(() => {
        cleanup();
        mockGridLayout.resetOptions();
    });

    test('a group header moved past the viewport stays scrolled into view', async () => {
        onTestFinished(polyfillOffsetParent());
        onTestFinished(installFocusScroll());
        mockGridLayout.asyncScrollEvents = true;
        const a: ColDef = { field: 'a', width: 100 };
        const married: ColGroupDef = {
            headerName: 'Married',
            marryChildren: true,
            children: Array.from({ length: 12 }, (_, i) => ({ field: `b${i}`, width: 100 })),
        };
        let api: GridApi | undefined;
        const { container } = render(
            <React.StrictMode>
                <AgGridReact
                    columnDefs={[{ headerName: 'Group', children: [a] }, married]}
                    rowData={[{}]}
                    onGridReady={(e) => (api = e.api)}
                />
            </React.StrictMode>
        );
        const header = (await findByText(container, 'Group')).closest<HTMLElement>('.ag-header-group-cell')!;
        act(() => dispatchGridSizeChanged(api!, 400));
        header.focus();
        header.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
        await userEvent.click(await findByText(container, 'Move Right'));
        await waitFor(() =>
            expect(document.activeElement!.closest('.ag-header-group-cell')?.textContent?.trim()).toBe('Group')
        );
        const left = api!.getColumn('a')!.getLeft()!;
        const expectInView = () => {
            const range = api!.getHorizontalPixelRange();
            expect(range.left).toBeLessThanOrEqual(left);
            expect(range.right).toBeGreaterThanOrEqual(left + 100);
        };
        expectInView();
        const focused = document.activeElement!.closest('.ag-header-group-cell');
        await waitFor(() => expect(getRevealedElements().at(-1)).toBe(focused));
        expectInView();
    });
});
