import { act, cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, test } from 'vitest';

import type { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import { ColumnMenuModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

let restoreOffsetParent: (() => void) | undefined;

function enableOffsetParentPolyfill(): void {
    if (restoreOffsetParent) {
        return;
    }
    const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent');
    Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
        configurable: true,
        get(this: HTMLElement) {
            return this.closest('.ag-measurement-container') ? null : this.parentElement;
        },
    });
    restoreOffsetParent = () => {
        if (original) {
            Object.defineProperty(HTMLElement.prototype, 'offsetParent', original);
        } else {
            delete (HTMLElement.prototype as { offsetParent?: unknown }).offsetParent;
        }
        restoreOffsetParent = undefined;
    };
}

async function press(el: HTMLElement): Promise<void> {
    await act(async () => {
        el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        // A real mouse click reports a click count via `detail`; keyboard/programmatic clicks report 0.
        el.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
        await new Promise((resolve) => setTimeout(resolve, 10));
    });
}

describe('React column header button toggles its popup closed on second click (AG-16350)', () => {
    afterEach(() => {
        cleanup();
        restoreOffsetParent?.();
    });

    test('menu and filter buttons: a second click closes the popup and it stays closed', async () => {
        enableOffsetParentPolyfill();

        const apiRef: { current?: GridApi } = {};
        const columnDefs: ColDef[] = [{ field: 'athlete', filter: true }];
        const container = render(
            <AgGridReact
                rowData={[{ athlete: 'Michael Phelps' }]}
                columnDefs={columnDefs}
                suppressMenuHide={true}
                modules={[AllCommunityModule, ColumnMenuModule]}
                onGridReady={(e: GridReadyEvent) => {
                    apiRef.current = e.api;
                }}
            />
        ).container;

        const menuButton = () => container.querySelector<HTMLElement>('.ag-header-cell-menu-button');
        const filterButton = () => container.querySelector<HTMLElement>('.ag-header-cell-filter-button');

        await waitFor(() => {
            expect(menuButton()).toBeTruthy();
            expect(filterButton()).toBeTruthy();
        });

        // Column menu button: first press opens, second press closes and stays closed.
        await press(menuButton()!);
        expect(document.querySelectorAll('.ag-popup').length).toBe(1);
        await press(menuButton()!);
        expect(document.querySelectorAll('.ag-popup').length).toBe(0);

        // Filter button: first press opens, second press closes and stays closed.
        await press(filterButton()!);
        expect(document.querySelectorAll('.ag-popup').length).toBe(1);
        await press(filterButton()!);
        expect(document.querySelectorAll('.ag-popup').length).toBe(0);
    });
});
