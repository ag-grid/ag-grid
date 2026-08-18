import { waitFor } from '@testing-library/dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { polyfillOffsetParent } from 'ag-test-utils';
import React from 'react';

import type { GridApi } from 'ag-grid-community';
import {
    AllEnterpriseModule,
    ClientSideRowModelModule,
    ColumnMenuModule,
    ContextMenuModule,
    ValidationModule,
} from 'ag-grid-enterprise';
import type { CustomMenuItemProps } from 'ag-grid-react';
import { AgGridReact, useGridMenuItem } from 'ag-grid-react';

// happy-dom reports offsetParent as null, which the focus-management utilities read as
// "not visible"; polyfill it so focusable detection inside the menu works.
Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
    configurable: true,
    get() {
        return this.parentNode;
    },
});

// A framework (React) custom menu item — its DOM is rendered asynchronously.
const CustomMenuItem = ({ name }: CustomMenuItemProps) => {
    useGridMenuItem({ configureDefaults: () => true });
    return <div className="ag-menu-option-text">{name}</div>;
};

describe('React menu initial focus with async framework menu items', () => {
    it('places keyboard focus inside the context menu once an async framework item has rendered', async () => {
        const customName = 'Custom Item';

        render(
            <AgGridReact
                columnDefs={[{ field: 'name' }]}
                rowData={[{ name: 'cell value' }]}
                getContextMenuItems={() => [{ name: customName, menuItem: CustomMenuItem }]}
                modules={[ValidationModule, ClientSideRowModelModule, ContextMenuModule]}
            />
        );

        const cell = screen.getByRole('gridcell', { name: 'cell value' });
        await userEvent.pointer({ keys: '[MouseRight>]', target: cell });

        // Wait for the async React menu item to render into the menu.
        const menuItem = await screen.findByRole('menuitem', { name: customName });

        // Focus must land on the first menu item, not remain on the menu's tab guard.
        await waitFor(() => {
            expect(document.activeElement).toBe(menuItem);
        });
    });

    it('places keyboard focus inside the column menu (ALT+DOWN) once an async framework item has rendered', async () => {
        const customName = 'Custom Item';

        render(
            <AgGridReact
                columnDefs={[{ field: 'name' }]}
                rowData={[{ name: 'cell value' }]}
                getMainMenuItems={() => [{ name: customName, menuItem: CustomMenuItem }]}
                modules={[ValidationModule, ClientSideRowModelModule, ColumnMenuModule]}
            />
        );

        const header = screen.getByRole('columnheader', { name: /name/i });
        header.focus();
        await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');

        const menuItem = await screen.findByRole('menuitem', { name: customName });

        await waitFor(() => {
            expect(document.activeElement).toBe(menuItem);
        });
    });

    it('places keyboard focus inside the Columns Tool Panel / Chooser menu once an async framework item has rendered', async () => {
        // The Columns Tool Panel and Column Chooser share ToolPanelContextMenu; the chooser is the
        // reliably drivable surface without layout, so it stands in for both here.
        const customName = 'Custom Item';
        let api: GridApi | undefined;

        // The chooser's virtual list needs the measurement-container-aware offsetParent polyfill to
        // render its rows without layout; the file-level polyfill above is enough only for the open menu.
        const restoreOffsetParent = polyfillOffsetParent();

        render(
            <AgGridReact
                columnDefs={[{ field: 'name' }]}
                rowData={[{ name: 'cell value' }]}
                onGridReady={(e) => {
                    api = e.api;
                }}
                getColumnMenuItems={() => [{ name: customName, menuItem: CustomMenuItem }]}
                modules={[AllEnterpriseModule]}
            />
        );

        await waitFor(() => expect(api).toBeTruthy());
        api!.showColumnChooser();

        // happy-dom has no layout engine, so force the chooser's virtual list to render its items.
        const viewport = await waitFor(() => {
            const el = document.querySelector('.ag-column-select-virtual-list-viewport') as HTMLElement | null;
            if (!el) {
                throw new Error('chooser viewport not rendered');
            }
            return el;
        });
        Object.defineProperty(viewport, 'offsetHeight', { value: 200, configurable: true });
        viewport.dispatchEvent(new Event('scroll'));

        // Right-click the column's entry in the chooser to open its menu.
        const entry = await waitFor(() => {
            const el = Array.from(document.querySelectorAll<HTMLElement>('.ag-column-select-column')).find((e) =>
                e.textContent?.includes('Name')
            );
            if (!el) {
                throw new Error('chooser column entry not rendered');
            }
            return el;
        });
        const row = (entry.closest('.ag-virtual-list-item') as HTMLElement | null) ?? entry;
        row.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 }));

        const menuItem = await screen.findByRole('menuitem', { name: customName });

        await waitFor(() => {
            expect(document.activeElement).toBe(menuItem);
        });

        restoreOffsetParent();
    });

    it('still focuses the first native menu item (no regression for synchronous items)', async () => {
        const nativeName = 'Native Item';

        render(
            <AgGridReact
                columnDefs={[{ field: 'name' }]}
                rowData={[{ name: 'cell value' }]}
                getContextMenuItems={() => [{ name: nativeName, action: () => {} }]}
                modules={[ValidationModule, ClientSideRowModelModule, ContextMenuModule]}
            />
        );

        const cell = screen.getByRole('gridcell', { name: 'cell value' });
        await userEvent.pointer({ keys: '[MouseRight>]', target: cell });

        const menuItem = await screen.findByRole('menuitem', { name: nativeName });

        await waitFor(() => {
            expect(document.activeElement).toBe(menuItem);
        });
    });
});
