import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ClientSideRowModelModule, ContextMenuModule, ValidationModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

// Enables testing the context menu with async data
Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
    get() {
        return this.parentNode;
    },
});

describe('React Jsdom Context menu ', () => {
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
});
