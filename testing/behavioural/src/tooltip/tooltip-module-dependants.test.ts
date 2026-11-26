import { fireEvent, getByRole, getByTestId, waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { userEvent } from '@testing-library/user-event';
import { TestGridsManager, getVisibleTooltips, waitForTooltips } from 'ag-test-utils';

import {
    PaginationModule,
    TextEditorModule,
    TooltipModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import type { GridOptions, Module } from 'ag-grid-community';

describe('Modules that depend on the tooltip core', () => {
    const grids = new TestGridsManager({ modules: [TextEditorModule, PaginationModule] });

    beforeAll(() => setupAgTestIds());
    afterEach(() => {
        grids.reset();
        vi.restoreAllMocks();
    });

    const setTruncated = (element: HTMLElement) => {
        vi.spyOn(element, 'clientWidth', 'get').mockReturnValue(100);
        vi.spyOn(element, 'scrollWidth', 'get').mockReturnValue(200);
    };

    test.each([
        { name: 'are hidden without TooltipModule', modules: [], expectTooltips: false },
        { name: 'are shown with TooltipModule', modules: [TooltipModule], expectTooltips: true },
    ])('automatic cell, select and built-in control tooltips $name', async ({ modules, expectTooltips }) => {
        const api = await grids.createGridAndWait(
            'dependants-native',
            {
                columnDefs: [{ field: 'value', editable: true }],
                rowData: [{ value: 'One' }, { value: 'Two' }],
                pagination: true,
                paginationPageSize: 1,
                paginationPageSizeSelector: [1, 2],
                enableBrowserTooltips: true,
            },
            { modules: modules as Module[] }
        );
        const grid = getGridElement(api)! as HTMLElement;
        const next = getByRole(grid, 'button', { name: 'Next Page' });
        const cell = grid.querySelector<HTMLElement>('.ag-cell')!;
        const pageSize = grid.querySelector<HTMLElement>('.ag-paging-page-size .ag-select')!;
        setTruncated(cell);
        setTruncated(pageSize.querySelector<HTMLElement>('.ag-picker-field-display')!);
        fireEvent.mouseEnter(cell);
        fireEvent.mouseEnter(pageSize);

        if (expectTooltips) {
            expect(next).toHaveAttribute('title', 'Go to next page');
            await waitFor(() => expect(cell).toHaveAttribute('title', 'One'));
            await waitFor(() => expect(pageSize).toHaveAttribute('title', '1'));
        } else {
            expect(next).not.toHaveAttribute('title');
            expect(cell).not.toHaveAttribute('title');
            expect(pageSize).not.toHaveAttribute('title');
        }
    });

    test('editing without TooltipModule still shows validation errors on hover', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'A', editable: true },
                { field: 'B', editable: false },
            ],
            rowData: [{ id: 'r1', A: 'a1', B: 'b1' }],
            getRowId: (params) => String(params.data.id),
            editType: 'fullRow',
            getFullRowEditValidationErrors: ({ editorsState }) =>
                editorsState.some((state) => String(state.newValue).includes('bad')) ? ['Row is not allowed'] : [],
            tooltipShowDelay: 0,
            tooltipSwitchShowDelay: 0,
        };
        const api = await grids.createGridAndWait('dependants-validation', gridOptions);
        const grid = getGridElement(api)! as HTMLElement;

        await userEvent.dblClick(await waitFor(() => getByTestId(grid, agTestIdFor.cell('r1', 'A'))));
        await userEvent.keyboard('bad');

        await userEvent.hover(await waitFor(() => getByTestId(grid, agTestIdFor.cell('r1', 'B'))));
        await waitForTooltips(1);
        expect(getVisibleTooltips()[0]).toHaveTextContent('Row is not allowed');
    });
});
