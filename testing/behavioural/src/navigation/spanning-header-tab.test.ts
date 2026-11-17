import { waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import { TestGridsManager } from 'ag-test-utils';

import { getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

describe('Tab navigation from spanning headers', () => {
    const gridsManager = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => gridsManager.reset());

    test.each(['background', 'checkbox'])(
        'Shift+Tab leaves the grid after clicking the selection header %s',
        async (target) => {
            const before = document.createElement('button');
            document.body.appendChild(before);
            try {
                const api = await gridsManager.createGridAndWait('grid', {
                    columnDefs: [
                        { headerName: 'Participant', children: [{ field: 'athlete' }, { field: 'country' }] },
                        { field: 'sport' },
                    ],
                    rowSelection: { mode: 'multiRow' },
                    rowData: [{ athlete: 'Anna', country: 'France', sport: 'Skiing' }],
                });
                const header = getGridElement(api)!.querySelector<HTMLElement>(
                    '.ag-header-cell[col-id="ag-Grid-SelectionColumn"]'
                )!;
                const user = userEvent.setup();
                await user.click(target === 'checkbox' ? header.querySelector('input')! : header);
                expect(header.contains(document.activeElement)).toBe(true);
                await user.tab({ shift: true });
                await waitFor(() => expect(document.activeElement).toBe(before));
            } finally {
                before.remove();
            }
        }
    );

    test.each([false, true])(
        'clicking a nested header respects suppressSpanHeaderHeight=%s',
        async (suppressSpanHeaderHeight) => {
            const api = await gridsManager.createGridAndWait('grid', {
                columnDefs: [
                    {
                        headerName: 'Participant',
                        children: [
                            {
                                groupId: 'details',
                                headerName: 'Details',
                                children: [{ field: 'athlete' }, { field: 'country' }],
                            },
                            { field: 'sport', suppressSpanHeaderHeight },
                        ],
                    },
                ],
                rowData: [{ athlete: 'Anna', country: 'France', sport: 'Skiing' }],
            });
            const grid = getGridElement(api)!;
            const sport = grid.querySelector<HTMLElement>('.ag-header-cell[col-id="sport"]')!;
            const user = userEvent.setup();
            await user.click(sport);
            await user.tab({ shift: true });
            const expected = suppressSpanHeaderHeight
                ? grid.querySelector('.ag-header-cell[col-id="country"]')
                : grid.querySelector('.ag-header-group-cell[col-id="details_0"]');
            expect(expected).not.toBeNull();
            expect(document.activeElement).toBe(expected);
        }
    );

    test.each([
        { enableRtl: false, pivotDefaultExpanded: 0 },
        { enableRtl: false, pivotDefaultExpanded: -1 },
        { enableRtl: true, pivotDefaultExpanded: 0 },
        { enableRtl: true, pivotDefaultExpanded: -1 },
    ])(
        'Shift+Tab reaches the last pivot chip (RTL=$enableRtl, expanded=$pivotDefaultExpanded)',
        async ({ enableRtl, pivotDefaultExpanded }) => {
            const api = await gridsManager.createGridAndWait('grid', {
                columnDefs: [
                    { field: 'country', rowGroup: true },
                    { field: 'sport', pivot: true, pivotSort: 'asc', initialPivotSort: 'asc' },
                    { field: 'year', pivot: true, pivotSort: 'asc', initialPivotSort: 'asc' },
                    { field: 'gold', aggFunc: 'sum' },
                ],
                defaultColDef: { flex: 1, minWidth: 130, enableValue: true, enableRowGroup: true, enablePivot: true },
                autoGroupColumnDef: { minWidth: 200, pinned: enableRtl ? 'right' : 'left' },
                enableRtl,
                pivotMode: true,
                pivotDefaultExpanded,
                pivotPanelShow: 'always',
                rowData: [
                    { country: 'France', sport: 'Alpine Skiing', year: 2000, gold: 1 },
                    { country: 'France', sport: 'Wrestling', year: 2000, gold: 2 },
                ],
            });
            const grid = getGridElement(api)!;
            const column = api.getDisplayedCenterColumns()[0];
            const cell = grid.querySelector<HTMLElement>(
                `.ag-row[row-index="0"] .ag-cell[col-id="${column.getColId()}"]`
            )!;
            cell.focus();
            const user = userEvent.setup();
            await user.keyboard(pivotDefaultExpanded === 0 ? '{ArrowUp}{ArrowUp}' : '{ArrowUp}{ArrowUp}{ArrowUp}');
            expect(document.activeElement?.textContent).toContain('Alpine Skiing');
            await user.keyboard(enableRtl ? '{ArrowRight}' : '{ArrowLeft}');
            expect(document.activeElement?.getAttribute('col-id')).toBe('ag-Grid-AutoColumn');
            await user.tab({ shift: true });
            await waitFor(() => {
                expect(document.activeElement?.closest('.ag-column-drop-cell')?.textContent).toContain('Year');
            });
        }
    );
});
