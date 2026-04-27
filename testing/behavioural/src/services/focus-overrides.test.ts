import { userEvent } from '@testing-library/user-event';

import type {
    ColDef,
    FocusGridInnerElementParams,
    GridApi,
    GridOptions,
    NavigateToNextCellParams,
    NavigateToNextHeaderParams,
    TabToNextCellParams,
    TabToNextGridContainerParams,
    TabToNextHeaderParams,
} from 'ag-grid-community';
import { PaginationModule, getGridElement } from 'ag-grid-community';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

interface RowData {
    athlete: string;
    country: string;
    sport: string;
}

const rowData: RowData[] = [
    { athlete: 'A', country: 'UK', sport: 'S1' },
    { athlete: 'B', country: 'IE', sport: 'S2' },
    { athlete: 'C', country: 'PT', sport: 'S3' },
];

const columnDefs: ColDef<RowData>[] = [{ field: 'athlete' }, { field: 'country' }, { field: 'sport' }];

async function waitForCondition(
    description: string,
    condition: () => boolean,
    timeoutMs = 300,
    pollMs = 5
): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        if (condition()) {
            return;
        }
        await asyncSetTimeout(pollMs);
    }
    throw new Error(`Timed out waiting for ${description}`);
}

function dispatchKeyDown(key: string, opts?: KeyboardEventInit): void {
    const activeElement = document.activeElement as HTMLElement | null;
    if (!activeElement) {
        throw new Error('Expected active element before dispatching keyboard event');
    }
    activeElement.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...opts }));
}

function isFocusedCell(api: GridApi, rowIndex: number, colId: string): boolean {
    const focusedCell = api.getFocusedCell();
    return focusedCell?.rowIndex === rowIndex && focusedCell?.column.getColId() === colId;
}

function getFocusedHeaderColId(): string | null {
    const activeElement = document.activeElement as HTMLElement | null;
    return activeElement?.closest('.ag-header-cell')?.getAttribute('col-id') ?? null;
}

describe('Focus Overrides', () => {
    const gridsManager = new TestGridsManager();

    afterEach(() => {
        gridsManager.reset();
    });

    test('focusGridInnerElement override is used when shift-tabbing into grid from below', async () => {
        const host = document.createElement('div');
        const aboveInput = document.createElement('input');
        const gridDiv = document.createElement('div');
        const belowInput = document.createElement('input');
        host.append(aboveInput, gridDiv, belowInput);
        document.body.appendChild(host);

        let api: GridApi<RowData>;
        const focusGridInnerElement = vi.fn((params: FocusGridInnerElementParams) => {
            if (params.fromBottom) {
                api.setFocusedCell(2, 'sport');
                return true;
            }
            return false;
        });

        const gridOptions: GridOptions<RowData> = {
            columnDefs,
            rowData,
            tabIndex: 0,
            focusGridInnerElement,
        };

        try {
            api = await gridsManager.createGridAndWait<RowData>(gridDiv, gridOptions);
            const gridElement = getGridElement(api) as HTMLElement;

            const user = userEvent.setup();
            belowInput.focus();
            expect(belowInput).toHaveFocus();

            await user.tab({ shift: true });
            const bottomGuard = gridElement.querySelector<HTMLElement>('.ag-tab-guard-bottom');
            bottomGuard?.focus();

            await waitForCondition(
                'focusGridInnerElement callback invocation',
                () => focusGridInnerElement.mock.calls.length > 0
            );
            await waitForCondition('focus moved to callback-selected cell', () => isFocusedCell(api, 2, 'sport'));

            expect(focusGridInnerElement).toHaveBeenCalledWith(expect.objectContaining({ fromBottom: true }));
        } finally {
            host.remove();
        }
    });

    test('tabToNextGridContainer callback is invoked on backwards tab flow', async () => {
        const tabToNextGridContainer = vi.fn((_params: TabToNextGridContainerParams<RowData>) => undefined);

        const api = await gridsManager.createGridAndWait<RowData>(
            'myGrid',
            {
                columnDefs,
                rowData,
                pagination: true,
                paginationPageSize: 1,
                paginationPageSizeSelector: false,
                tabToNextGridContainer,
            },
            { modules: [PaginationModule] }
        );

        const gridElement = getGridElement(api) as HTMLElement;
        const pagingButtons = Array.from(gridElement.querySelectorAll<HTMLElement>('.ag-paging-button'));
        const firstButton = pagingButtons[0];
        expect(firstButton).toBeTruthy();

        firstButton.focus();
        expect(firstButton).toHaveFocus();
        dispatchKeyDown('Tab', { shiftKey: true });

        await waitForCondition('tabToNextGridContainer callback invocation', () =>
            tabToNextGridContainer.mock.calls.some(([params]) => params?.backwards === true)
        );

        expect(tabToNextGridContainer).toHaveBeenCalledWith(
            expect.objectContaining({
                backwards: true,
            })
        );
    });

    test('tabToNextCell override reroutes tabbing target', async () => {
        const tabToNextCell = vi.fn((params: TabToNextCellParams<RowData>) => {
            if (
                params.previousCellPosition.rowIndex === 0 &&
                params.previousCellPosition.column.getColId() === 'athlete'
            ) {
                return {
                    rowIndex: 2,
                    rowPinned: null,
                    column: params.nextCellPosition?.column ?? params.previousCellPosition.column,
                };
            }

            return params.nextCellPosition ?? false;
        });

        const api = await gridsManager.createGridAndWait<RowData>('myGrid', {
            columnDefs,
            rowData,
            tabToNextCell,
        });

        api.setFocusedCell(0, 'athlete');
        await asyncSetTimeout(0);

        dispatchKeyDown('Tab');

        await waitForCondition('tabToNextCell callback invocation', () => tabToNextCell.mock.calls.length > 0);
        await waitForCondition('focus moved to callback-selected cell', () => isFocusedCell(api, 2, 'country'));

        expect(tabToNextCell).toHaveBeenCalledWith(
            expect.objectContaining({
                backwards: false,
            })
        );
    });

    test('navigateToNextCell override reroutes arrow navigation target', async () => {
        const navigateToNextCell = vi.fn((params: NavigateToNextCellParams<RowData>) => {
            if (params.key === 'ArrowRight') {
                return {
                    rowIndex: 2,
                    rowPinned: null,
                    column: params.nextCellPosition?.column ?? params.previousCellPosition.column,
                };
            }

            return params.nextCellPosition;
        });

        const api = await gridsManager.createGridAndWait<RowData>('myGrid', {
            columnDefs,
            rowData,
            navigateToNextCell,
        });

        api.setFocusedCell(0, 'athlete');
        await asyncSetTimeout(0);

        dispatchKeyDown('ArrowRight');

        await waitForCondition(
            'navigateToNextCell callback invocation',
            () => navigateToNextCell.mock.calls.length > 0
        );
        await waitForCondition('focus moved to callback-selected cell', () => isFocusedCell(api, 2, 'country'));

        expect(navigateToNextCell).toHaveBeenCalledWith(
            expect.objectContaining({
                key: 'ArrowRight',
            })
        );
    });

    test('tabToNextHeader override reroutes header tab target', async () => {
        const tabToNextHeader = vi.fn((params: TabToNextHeaderParams<RowData>) => {
            const column = params.api.getColumn('sport');
            if (!column) {
                return false;
            }
            return { headerRowIndex: 0, column };
        });

        const api = await gridsManager.createGridAndWait<RowData>('myGrid', {
            columnDefs,
            rowData,
            tabToNextHeader,
        });

        api.setFocusedHeader('athlete');
        await asyncSetTimeout(0);

        dispatchKeyDown('Tab');

        await waitForCondition('tabToNextHeader callback invocation', () => tabToNextHeader.mock.calls.length > 0);
        await waitForCondition(
            'header focus moved to callback-selected header',
            () => getFocusedHeaderColId() === 'sport'
        );
    });

    test('navigateToNextHeader override reroutes arrow navigation target', async () => {
        const navigateToNextHeader = vi.fn((params: NavigateToNextHeaderParams<RowData>) => {
            const column = params.api.getColumn('sport');
            if (!column) {
                return null;
            }
            return { headerRowIndex: 0, column };
        });

        const api = await gridsManager.createGridAndWait<RowData>('myGrid', {
            columnDefs,
            rowData,
            navigateToNextHeader,
        });

        api.setFocusedHeader('athlete');
        await asyncSetTimeout(0);

        dispatchKeyDown('ArrowRight');

        await waitForCondition(
            'navigateToNextHeader callback invocation',
            () => navigateToNextHeader.mock.calls.length > 0
        );
        await waitForCondition(
            'header focus moved to callback-selected header',
            () => getFocusedHeaderColId() === 'sport'
        );
    });
});
