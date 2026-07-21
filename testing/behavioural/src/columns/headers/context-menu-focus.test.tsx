import { waitFor } from '@testing-library/dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ClientSideRowModelModule, ColumnMenuModule, ContextMenuModule, ValidationModule } from 'ag-grid-enterprise';
import type { CustomMenuItemProps } from 'ag-grid-react';
import { AgGridReact, useGridMenuItem } from 'ag-grid-react';

import { ignoreConsoleLicenseKeyError } from '../../test-utils';

// jsdom reports offsetParent as null, which the focus-management utilities read as
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
    beforeEach(() => {
        ignoreConsoleLicenseKeyError();
    });

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
