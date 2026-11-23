import { TestGridsManager, installFilterLayoutMock, uninstallFilterLayoutMock } from 'ag-test-utils';

import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    GridStateModule,
    NumberFilterModule,
    TextFilterModule,
    setupAgTestIds,
} from 'ag-grid-community';
import { ColumnMenuModule, FiltersToolPanelModule, MultiFilterModule, SetFilterModule } from 'ag-grid-enterprise';

export interface Row {
    name?: string | null;
    age?: number;
}

export const TEXT_MICH = { filterType: 'text', type: 'contains', filter: 'mich' };

export const ROWS: Row[] = [
    { name: 'michael', age: 30 },
    { name: 'michelle', age: 25 },
    { name: 'bob', age: 40 },
    { name: 'alice', age: 35 },
];

/** Every sub-floating-filter in the `.ag-multi-floating-filter` cell, hidden ones included. */
export function floatingChildren(): HTMLElement[] {
    const container = document.querySelector<HTMLElement>('.ag-multi-floating-filter');
    if (!container) {
        throw new Error('Multi floating filter container not present');
    }
    return Array.from(container.children).filter((c): c is HTMLElement => c instanceof HTMLElement);
}

/** The `.ag-multi-floating-filter` cell's currently displayed child (the non-hidden sub-floating-filter). */
export function visibleFloatingChild(): HTMLElement {
    const shown = floatingChildren().filter((c) => !c.classList.contains('ag-hidden'));
    if (shown.length !== 1) {
        throw new Error(`Expected exactly one visible multi floating child, found ${shown.length}`);
    }
    return shown[0];
}

/** 'set' when the visible sub-floating-filter is the read-only set one, otherwise 'text'. */
export function visibleFloatingKind(): 'set' | 'text' {
    return visibleFloatingChild().classList.contains('ag-set-floating-filter-input') ? 'set' : 'text';
}

export function visibleFloatingInput(): HTMLInputElement {
    const input = visibleFloatingChild().querySelector<HTMLInputElement>('input');
    if (!input) {
        throw new Error('Visible multi floating child has no input');
    }
    return input;
}

/** The grids manager of a multi-filter test file, with the hooks every such file shares. */
export function setupMultiFilterSuite(): TestGridsManager {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            GridStateModule,
            TextFilterModule,
            NumberFilterModule,
            MultiFilterModule,
            SetFilterModule,
            ColumnMenuModule,
            FiltersToolPanelModule,
        ],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => {
        try {
            gridsManager.reset();
        } finally {
            vi.restoreAllMocks();
        }
    });
    return gridsManager;
}

export async function createFloatingGrid(gridsManager: TestGridsManager): Promise<GridApi<Row>> {
    const options: GridOptions<Row> = {
        columnDefs: [
            {
                field: 'name',
                filter: 'agMultiColumnFilter',
                floatingFilter: true,
                filterParams: {
                    filters: [
                        { filter: 'agTextColumnFilter', filterParams: { debounceMs: 0, maxNumConditions: 1 } },
                        { filter: 'agSetColumnFilter' },
                    ],
                },
            },
        ],
        rowData: ROWS,
    };
    return gridsManager.createGridAndWait('grid1', options);
}
