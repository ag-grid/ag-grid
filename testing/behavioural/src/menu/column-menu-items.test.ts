import { waitFor } from '@testing-library/dom';

import type { ColumnMenuItemsSource, GetColumnMenuItemsParams, GridApi } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

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
        }
        restoreOffsetParent = undefined;
    };
}

function menuOptionText(name: string): HTMLElement | null {
    return (
        Array.from(document.querySelectorAll<HTMLElement>('.ag-menu-option-text')).find(
            (el) => el.textContent?.trim() === name
        ) ?? null
    );
}

async function waitForMenuOption(name: string): Promise<void> {
    await waitFor(() => expect(menuOptionText(name)).toBeTruthy());
}

describe('getColumnMenuItems / columnMenuItems on the column menu', () => {
    const gridMgr = new TestGridsManager({ modules: [AllEnterpriseModule] });

    const rowData = [
        { athlete: 'Michael Phelps', age: 23, country: 'United States' },
        { athlete: 'Missy Franklin', age: 17, country: 'United States' },
    ];

    afterEach(() => {
        gridMgr.reset();
        restoreOffsetParent?.();
        vi.resetAllMocks();
    });

    test('getColumnMenuItems fires for the column menu with source "columnMenu" and string-token defaults', async () => {
        let captured: GetColumnMenuItemsParams | undefined;
        const api = await gridMgr.createGridAndWait('menu-source', {
            columnDefs: [{ field: 'athlete' }, { field: 'age' }],
            rowData,
            getColumnMenuItems: (params) => {
                captured = params;
                return [...params.defaultItems, { name: 'Custom' }];
            },
        });

        enableOffsetParentPolyfill();
        api.showColumnMenu('athlete');
        await waitForMenuOption('Custom');

        expect(captured!.source).toBe<ColumnMenuItemsSource>('columnMenu');
        expect(captured!.column?.getColId()).toBe('athlete');
        expect(captured!.defaultItems.every((item) => typeof item === 'string')).toBe(true);
    });

    test('getColumnMenuItems takes precedence over the legacy getMainMenuItems', async () => {
        const getMainMenuItems = vi.fn(() => [{ name: 'FromLegacyGrid' }]);
        const api = await gridMgr.createGridAndWait('menu-grid-precedence', {
            columnDefs: [{ field: 'athlete' }, { field: 'age' }],
            rowData,
            getColumnMenuItems: () => [{ name: 'FromNewGrid' }],
            getMainMenuItems,
        });

        enableOffsetParentPolyfill();
        api.showColumnMenu('athlete');
        await waitForMenuOption('FromNewGrid');

        expect(menuOptionText('FromLegacyGrid')).toBeNull();
        expect(getMainMenuItems).not.toHaveBeenCalled();
    });

    test('col-level columnMenuItems takes precedence over the legacy mainMenuItems', async () => {
        const api = await gridMgr.createGridAndWait('menu-col-precedence', {
            columnDefs: [
                {
                    field: 'athlete',
                    columnMenuItems: [{ name: 'FromNewCol' }],
                    mainMenuItems: [{ name: 'FromLegacyCol' }],
                },
                { field: 'age' },
            ],
            rowData,
        });

        enableOffsetParentPolyfill();
        api.showColumnMenu('athlete');
        await waitForMenuOption('FromNewCol');

        expect(menuOptionText('FromLegacyCol')).toBeNull();
    });

    test('legacy getMainMenuItems still drives the column menu when no new props are set', async () => {
        const api = await gridMgr.createGridAndWait('menu-legacy-only', {
            columnDefs: [{ field: 'athlete' }, { field: 'age' }],
            rowData,
            getMainMenuItems: (params) => [...params.defaultItems, { name: 'LegacyStillWorks' }],
        });

        enableOffsetParentPolyfill();
        api.showColumnMenu('athlete');
        await waitForMenuOption('LegacyStillWorks');
    });
});

describe('getColumnMenuItems on the Column Chooser', () => {
    const gridMgr = new TestGridsManager({ modules: [AllEnterpriseModule] });

    const rowData = [{ athlete: 'Michael Phelps', age: 23, country: 'United States' }];

    afterEach(() => {
        gridMgr.reset();
    });

    test('right-clicking a column in the Column Chooser fires getColumnMenuItems with source "columnChooser"', async () => {
        let captured: GetColumnMenuItemsParams | undefined;
        const api = await gridMgr.createGridAndWait('chooser-source', {
            columnDefs: [{ field: 'athlete' }, { field: 'age' }, { field: 'country' }],
            rowData,
            getColumnMenuItems: (params) => {
                captured = params;
                return params.defaultItems;
            },
        });

        api.showColumnChooser();
        await asyncSetTimeout(10);

        const viewport = document.querySelector('.ag-column-select-virtual-list-viewport') as HTMLElement | null;
        expect(viewport).toBeTruthy();
        // jsdom has no layout engine, so force the virtual list to render its items.
        Object.defineProperty(viewport!, 'offsetHeight', { value: 200, configurable: true });
        viewport!.dispatchEvent(new Event('scroll'));
        await asyncSetTimeout(50);

        const entry = Array.from(document.querySelectorAll<HTMLElement>('.ag-column-select-column')).find((el) =>
            el.textContent?.includes('Athlete')
        );
        expect(entry).toBeTruthy();
        const row = (entry!.closest('.ag-virtual-list-item') as HTMLElement | null) ?? entry!;
        row.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 }));
        await asyncSetTimeout(10);

        expect(captured?.source).toBe<ColumnMenuItemsSource>('columnChooser');
        expect(captured?.column?.getColId()).toBe('athlete');

        api.hideColumnChooser();
    });
});
