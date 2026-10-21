import { waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { asyncSetTimeout, getVisibleTooltips, polyfillOffsetParent } from 'ag-test-utils';
import React from 'react';

import type { GridApi, IHeaderParams } from 'ag-grid-community';
import {
    AllEnterpriseModule,
    ClientSideRowModelModule,
    ColumnMenuModule,
    ContextMenuModule,
    RenderApiModule,
    TextFilterModule,
    TooltipModule,
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

const MouseMenuHeader = (params: IHeaderParams) => (
    <button onClick={(event) => params.showColumnMenuAfterMouseClick(event.nativeEvent)}>Year menu</button>
);

describe('React menu initial focus with async framework menu items', () => {
    it('focuses an async framework context menu item without showing its tooltip on mouse opening', async () => {
        const customName = 'Custom Item';

        render(
            <AgGridReact
                columnDefs={[{ field: 'name' }]}
                rowData={[{ name: 'cell value' }]}
                getContextMenuItems={() => [
                    { name: customName, menuItem: CustomMenuItem, tooltip: 'Custom tooltip' },
                    { name: 'Next item', tooltip: 'Next tooltip' },
                ]}
                tooltipTrigger="focus"
                modules={[ValidationModule, ClientSideRowModelModule, ContextMenuModule, TooltipModule]}
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
        await act(async () => {
            await asyncSetTimeout(0);
        });
        expect(getVisibleTooltips()).toHaveLength(0);

        await userEvent.keyboard('{ArrowDown}');
        await waitFor(() =>
            expect(getVisibleTooltips().map((tooltip) => tooltip.textContent)).toEqual(['Next tooltip'])
        );
        await userEvent.keyboard('{ArrowUp}');
        await waitFor(() =>
            expect(getVisibleTooltips().map((tooltip) => tooltip.textContent)).toEqual(['Custom tooltip'])
        );
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

    it.each(['keyboard', 'mouse'])(
        'keeps the %s-opened column menu focused when React replaces the header',
        async (opening) => {
            let api: GridApi;
            const rectSpy = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
                this: Element
            ) {
                return this.isConnected ? new DOMRect(0, 0, 100, 30) : new DOMRect();
            });
            vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
            try {
                render(
                    <AgGridReact
                        columnDefs={[
                            {
                                field: 'year',
                                headerComponent: opening === 'mouse' ? MouseMenuHeader : undefined,
                            },
                        ]}
                        rowData={[{ year: '2004' }]}
                        onGridReady={(event) => {
                            api = event.api;
                        }}
                        getColumnMenuItems={() => [{ name: 'Custom Item', menuItem: CustomMenuItem }]}
                        modules={[ValidationModule, ClientSideRowModelModule, ColumnMenuModule, RenderApiModule]}
                    />
                );
                const header = screen.getByRole('columnheader', { name: /year/i });
                if (opening === 'mouse') {
                    await userEvent.click(screen.getByRole('button', { name: 'Year menu' }));
                } else {
                    header.focus();
                    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
                }
                const item = await screen.findByRole('menuitem', { name: 'Custom Item' });
                await waitFor(() => expect(document.activeElement).toBe(item));

                await act(async () => {
                    api.refreshHeader();
                });
                expect(header.isConnected).toBe(false);
                act(() => {
                    vi.advanceTimersByTime(600);
                });
                expect(item.isConnected).toBe(true);
                expect(document.activeElement).toBe(item);

                await userEvent.keyboard('{Escape}');
                await waitFor(() =>
                    expect(document.activeElement).toBe(screen.getByRole('columnheader', { name: /year/i }))
                );
            } finally {
                rectSpy.mockRestore();
                vi.useRealTimers();
            }
        }
    );

    it('retains floating-filter menu input and focus across header refreshes', async () => {
        let api: GridApi;
        const rectSpy = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
            this: Element
        ) {
            return this.isConnected ? new DOMRect(0, 0, 100, 30) : new DOMRect();
        });
        vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
        try {
            const { container } = render(
                <AgGridReact
                    columnDefs={[{ field: 'year', filter: 'agTextColumnFilter', floatingFilter: true }]}
                    rowData={[{ year: '2004' }]}
                    onGridReady={(event) => {
                        api = event.api;
                    }}
                    modules={[ValidationModule, ClientSideRowModelModule, TextFilterModule, RenderApiModule]}
                />
            );
            const button = () => container.querySelector<HTMLElement>('.ag-floating-filter-button-button')!;
            const originalButton = button();
            await userEvent.click(originalButton);
            const menu = container.querySelector<HTMLElement>('.ag-filter-menu')!;
            const input = (await within(menu).findAllByRole('textbox'))[0];
            await userEvent.type(input, '2004');

            for (let i = 0; i < 2; i++) {
                await act(async () => {
                    api.refreshHeader();
                });
                act(() => {
                    vi.advanceTimersByTime(600);
                });
                expect(originalButton.isConnected).toBe(false);
                expect(input).toHaveFocus();
                expect(input).toHaveValue('2004');
            }
            await userEvent.keyboard('{Escape}');
            expect(menu.isConnected).toBe(false);
            expect(button()).toHaveFocus();
        } finally {
            rectSpy.mockRestore();
            vi.useRealTimers();
        }
    });

    it('toggles the column menu closed from the menu button of a replaced header', async () => {
        let api: GridApi;
        const rectSpy = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
            this: Element
        ) {
            return this.isConnected ? new DOMRect(0, 0, 100, 30) : new DOMRect();
        });
        vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
        try {
            const { container } = render(
                <AgGridReact
                    columnDefs={[{ field: 'year' }]}
                    rowData={[{ year: '2004' }]}
                    onGridReady={(event) => {
                        api = event.api;
                    }}
                    getColumnMenuItems={() => [{ name: 'Custom Item', menuItem: CustomMenuItem }]}
                    modules={[ValidationModule, ClientSideRowModelModule, ColumnMenuModule, RenderApiModule]}
                />
            );
            const menuButton = () => container.querySelector<HTMLElement>('.ag-header-cell-menu-button')!;
            const openedButton = menuButton();
            await userEvent.click(openedButton);
            await screen.findByRole('menuitem', { name: 'Custom Item' });

            await act(async () => {
                api.refreshHeader();
            });
            expect(openedButton.isConnected).toBe(false);
            act(() => {
                vi.advanceTimersByTime(600);
            });
            expect(screen.getByRole('menuitem', { name: 'Custom Item' }).isConnected).toBe(true);

            // Clicking the replacement button must toggle the menu closed, not spawn a second menu.
            await userEvent.click(menuButton());
            expect(screen.queryByRole('menuitem', { name: 'Custom Item' })).toBeNull();
        } finally {
            rectSpy.mockRestore();
            vi.useRealTimers();
        }
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
