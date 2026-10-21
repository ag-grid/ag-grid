import { waitFor } from '@testing-library/dom';
import { TestGridsManager, fireGridPointerDown, menuOption, polyfillOffsetParent } from 'ag-test-utils';

import type { MenuItemDef } from 'ag-grid-community';
import { ClientSideRowModelModule, getGridElement } from 'ag-grid-community';
import { ContextMenuModule } from 'ag-grid-enterprise';

let restoreOffsetParent: (() => void) | undefined;

function rightClickFirstCell(gridDiv: HTMLElement): void {
    const cell = gridDiv.querySelector<HTMLElement>('[row-index="0"] [col-id="athlete"]')!;
    fireGridPointerDown(cell, { button: 2, buttons: 2 });
    cell.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 }));
}

function hasLoadingIcon(): boolean {
    return document.querySelector('.ag-context-menu-loading-icon') != null;
}

describe('Context menu with async items', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, ContextMenuModule] });
    const rejections: unknown[] = [];
    const onRejection = (reason: unknown) => rejections.push(reason);

    beforeEach(() => {
        restoreOffsetParent = polyfillOffsetParent();
        rejections.length = 0;
        process.on('unhandledRejection', onRejection);
    });

    afterEach(() => {
        process.off('unhandledRejection', onRejection);
        gridsManager.reset();
        restoreOffsetParent?.();
        restoreOffsetParent = undefined;
    });

    test('the loading icon is removed when the items promise rejects', async () => {
        let rejectItems!: (reason: Error) => void;
        const api = await gridsManager.createGridAndWait('asyncItemsRejected', {
            columnDefs: [{ field: 'athlete' }],
            rowData: [{ athlete: 'Michael Phelps' }],
            getContextMenuItems: () =>
                new Promise<MenuItemDef[]>((_resolve, reject) => {
                    rejectItems = reject;
                }),
        });

        rightClickFirstCell(getGridElement(api)! as HTMLElement);
        expect(hasLoadingIcon()).toBe(true);

        rejectItems(new Error('items failed'));

        await waitFor(() => expect(rejections).toEqual([new Error('items failed')]));
        expect(hasLoadingIcon()).toBe(false);
    });

    test('an earlier request rejecting leaves the loading icon for the newer request', async () => {
        const pending: { resolve: (items: MenuItemDef[]) => void; reject: (reason: Error) => void }[] = [];
        const api = await gridsManager.createGridAndWait('asyncItemsStaleRejected', {
            columnDefs: [{ field: 'athlete' }],
            rowData: [{ athlete: 'Michael Phelps' }],
            getContextMenuItems: () =>
                new Promise<MenuItemDef[]>((resolve, reject) => {
                    pending.push({ resolve, reject });
                }),
        });
        const gridDiv = getGridElement(api)! as HTMLElement;

        rightClickFirstCell(gridDiv);
        rightClickFirstCell(gridDiv);
        pending[0].reject(new Error('stale items failed'));

        await waitFor(() => expect(rejections).toEqual([new Error('stale items failed')]));
        expect(hasLoadingIcon()).toBe(true);

        pending[1].resolve([{ name: 'Foo' }]);
        await waitFor(() => expect(menuOption('Foo')).not.toBeNull());
        expect(hasLoadingIcon()).toBe(false);
    });
});
