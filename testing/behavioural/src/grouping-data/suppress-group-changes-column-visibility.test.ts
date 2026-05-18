import type { AgColumn, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule, RowGroupingPanelModule } from 'ag-grid-enterprise';

import { AgGridHeaderDropZonesSelector } from '../../../../packages/ag-grid-enterprise/src/rowGrouping/columnDropZones/agGridHeaderDropZones';
import { TestGridsManager, asyncSetTimeout } from '../test-utils';

type SuppressValue = GridOptions['suppressGroupChangesColumnVisibility'];

describe('suppressGroupChangesColumnVisibility', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, RowGroupingPanelModule],
    });

    beforeEach(() => gridsManager.reset());
    afterEach(() => gridsManager.reset());

    async function createGrid(suppressGroupChangesColumnVisibility: SuppressValue): Promise<GridApi> {
        return gridsManager.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'athlete' }, { field: 'country', enableRowGroup: true }, { field: 'year' }],
            rowData: [
                { athlete: 'Michael Phelps', country: 'United States', year: 2008 },
                { athlete: 'Julian Weber', country: 'Romania', year: 2000 },
            ],
            rowGroupPanelShow: 'always',
            suppressGroupChangesColumnVisibility,
        });
    }

    function getRowGroupDropZonePanel(gridApi: GridApi): any {
        const country = gridApi.getColumn('country') as any;
        const HeaderDropZones = AgGridHeaderDropZonesSelector.component as any;
        const headerDropZones = country.createBean(new HeaderDropZones()) as any;
        return headerDropZones.rowGroupComp;
    }

    function makeSyntheticDragEvent(columns: AgColumn[]): any {
        return {
            dragSource: {
                getDragItem: () => ({ columns }),
            },
            fromNudge: false,
        };
    }

    /**
     * Expected column visibility after each grouping transition, for each supported value of
     * `suppressGroupChangesColumnVisibility`. `hiddenAfterGroup` is the expected visibility
     * after the column is added to the row groups; `hiddenAfterUngroup` is the expected
     * visibility after the column is subsequently removed from the row groups.
     */
    const cases: Array<{
        label: string;
        value: SuppressValue;
        hiddenAfterGroup: boolean;
        hiddenAfterUngroup: boolean;
    }> = [
        { label: 'default (undefined)', value: undefined, hiddenAfterGroup: true, hiddenAfterUngroup: false },
        { label: 'true', value: true, hiddenAfterGroup: false, hiddenAfterUngroup: false },
        {
            label: '"suppressHideOnGroup"',
            value: 'suppressHideOnGroup',
            hiddenAfterGroup: false,
            hiddenAfterUngroup: false,
        },
        {
            label: '"suppressShowOnUngroup"',
            value: 'suppressShowOnUngroup',
            hiddenAfterGroup: true,
            hiddenAfterUngroup: true,
        },
    ];

    describe.each(cases)('$label', ({ value, hiddenAfterGroup, hiddenAfterUngroup }) => {
        test('grid API: add then remove row group column', async () => {
            const api = await createGrid(value);
            const country = api.getColumn('country')!;

            expect(country.isVisible()).toBe(true);

            api.addRowGroupColumns(['country']);
            expect(country.isVisible()).toBe(!hiddenAfterGroup);

            api.removeRowGroupColumns(['country']);
            expect(country.isVisible()).toBe(!hiddenAfterUngroup);
        });

        test('drag: column dragged into the row group panel', async () => {
            const api = await createGrid(value);
            const country = api.getColumn('country')! as unknown as AgColumn;
            const panel = getRowGroupDropZonePanel(api);

            expect(country.isVisible()).toBe(true);

            // Simulates the final phase of `onDragEnter` on the row group drop zone,
            // which fires when a column header is dragged over the panel.
            panel['handleDragEnterEnd'](makeSyntheticDragEvent([country]));
            await asyncSetTimeout(0);

            expect(country.isVisible()).toBe(!hiddenAfterGroup);
        });

        test('drag: pill dragged out of the row group panel', async () => {
            const api = await createGrid(value);
            const country = api.getColumn('country')! as unknown as AgColumn;
            const panel = getRowGroupDropZonePanel(api);

            api.addRowGroupColumns(['country']);
            expect(country.isVisible()).toBe(!hiddenAfterGroup);

            // `onDragLeave` in the real flow first removes the column from row groups (via
            // `updateItems` -> `setRowGroupColumns`), then calls `handleDragLeaveEnd`. The
            // two together must respect the suppress setting — `handleDragLeaveEnd` must
            // not re-show a column the first step correctly left hidden.
            api.removeRowGroupColumns(['country']);
            panel['handleDragLeaveEnd'](makeSyntheticDragEvent([country]));
            await asyncSetTimeout(0);

            expect(country.isVisible()).toBe(!hiddenAfterUngroup);
        });
    });
});
