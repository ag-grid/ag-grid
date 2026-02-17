import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ClientSideRowModelModule, ColumnMenuModule, ContextMenuModule, ValidationModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

import { ignoreConsoleLicenseKeyError } from '../../test-utils';

// Enables testing the context menu with async data
Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
    get() {
        return this.parentNode;
    },
});

describe('React Jsdom Context menu ', () => {
    beforeEach(() => {
        ignoreConsoleLicenseKeyError();
    });

    it.each([true, false])('should trigger context menu action', async (isAsync) => {
        const cellValue = 'cell value';
        const contextOption = 'context option';
        const contextAction = jest.fn();
        const contextMenuItems = [{ name: contextOption, action: contextAction }];

        render(
            <AgGridReact
                columnDefs={[{ field: 'name' }]}
                rowData={[{ name: cellValue }]}
                getContextMenuItems={isAsync ? async () => contextMenuItems : () => contextMenuItems}
                modules={[ValidationModule, ClientSideRowModelModule, ContextMenuModule]}
            />
        );

        const tt = screen.getByRole('gridcell', { name: cellValue });

        await userEvent.pointer({
            keys: '[MouseRight>]',
            target: tt,
        });

        await userEvent.click(await screen.findByRole('menuitem', { name: contextOption }));

        expect(contextAction).toHaveBeenCalled();
    });

    it('should not show header context menu on long tap when suppressHeaderContextMenu is true', async () => {
        vi.useFakeTimers();
        try {
            render(
                <AgGridReact
                    columnDefs={[{ field: 'name', sortable: true, suppressHeaderContextMenu: true }]}
                    rowData={[{ name: 'cell value' }]}
                    modules={[ValidationModule, ClientSideRowModelModule, ColumnMenuModule]}
                />
            );

            const header = screen.getByRole('columnheader', { name: /name/i });
            const touch = new Touch({
                identifier: 1,
                target: header,
                clientX: 5,
                clientY: 5,
            });

            header.dispatchEvent(
                new TouchEvent('touchstart', {
                    bubbles: true,
                    cancelable: true,
                    touches: [touch],
                    targetTouches: [touch],
                    changedTouches: [touch],
                })
            );

            vi.advanceTimersByTime(600);

            expect(screen.queryByRole('dialog', { name: /column menu/i })).not.toBeInTheDocument();
        } finally {
            vi.useRealTimers();
        }
    });
});
