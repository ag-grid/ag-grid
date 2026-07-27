import { waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import type { AgColumn, ColDef, GridApi, HeaderLocation } from 'ag-grid-community';
import { getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

/**
 * A renamed header name is stored as an override on the column entity (and the group-id-keyed group
 * map), so it flows through the same display-name resolver the header tooltip and the row-group
 * machinery consume. These tests lock in two behaviours not covered by editable-header-name.test.ts:
 * the header tooltip reflecting a rename, and a leaf rename surviving a row-group/ungroup cycle.
 */
describe('Editable header name — tooltips', () => {
    const gridMgr = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => {
        gridMgr.reset();
        vi.resetAllMocks();
    });

    const rowData = [{ athlete: 'Michael Phelps' }];

    async function createGrid(
        columnDefs: ColDef[],
        extraOptions?: Record<string, any>
    ): Promise<{ api: GridApi; gridDiv: HTMLElement }> {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs,
            rowData,
            defaultColDef: { flex: 1, minWidth: 100 },
            tooltipShowDelay: 200,
            ...extraOptions,
        });
        return { api, gridDiv: getGridElement(api)! as HTMLElement };
    }

    const getTooltips = () => Array.from(document.querySelectorAll<HTMLElement>('.ag-tooltip, .ag-tooltip-custom'));
    const waitForTooltips = async (count: number) =>
        await waitFor(() => expect(getTooltips().length).toBe(count), { timeout: 2000 });

    async function hoverHeader(): Promise<void> {
        const headerCell = await waitFor(
            () => document.querySelector('.ag-header-cell[col-id="athlete"]') as HTMLElement
        );
        await userEvent.hover(headerCell);
        await asyncSetTimeout(250);
    }

    async function unhoverHeader(): Promise<void> {
        const headerCell = document.querySelector('.ag-header-cell[col-id="athlete"]') as HTMLElement;
        await userEvent.unhover(headerCell);
        await asyncSetTimeout(250);
        await waitForTooltips(0);
    }

    test('the header tooltip reflects the edited name after a rename', async () => {
        // headerTooltipValueGetter reads valueFormatted, which the tooltip service resolves from the
        // display name on each read, so a rename underneath the header must surface in the tooltip.
        const { api } = await createGrid([
            {
                field: 'athlete',
                headerNameEditable: true,
                headerTooltipValueGetter: (params) => params.valueFormatted ?? '',
            },
        ]);

        await hoverHeader();
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Athlete');
        await unhoverHeader();

        api.applyColumnState({ state: [{ colId: 'athlete', headerName: 'Renamed' }] });
        await asyncSetTimeout(1);

        await hoverHeader();
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Renamed');
    });

    test('a static headerTooltip string is unaffected by a rename', async () => {
        // headerTooltip is a fixed string independent of the display name, so a rename does not touch it.
        const { api } = await createGrid([{ field: 'athlete', headerNameEditable: true, headerTooltip: 'Static tip' }]);

        api.applyColumnState({ state: [{ colId: 'athlete', headerName: 'Renamed' }] });
        await asyncSetTimeout(1);
        const column = api.getColumn('athlete') as unknown as AgColumn;
        expect(api.getDisplayNameForColumn(column, 'header')).toBe('Renamed');

        await hoverHeader();
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Static tip');
    });
});

describe('Editable header name — header locations', () => {
    const gridMgr = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => {
        gridMgr.reset();
        vi.resetAllMocks();
    });

    // The override is resolved in getHeaderName ahead of the headerValueGetter, independent of the
    // location passed in, so the edited name must be returned for every consumer location.
    const locations: Exclude<HeaderLocation, null>[] = [
        'header',
        'columnDrop',
        'columnToolPanel',
        'csv',
        'filterToolPanel',
        'groupFilter',
        'model',
        'advancedFilter',
        'chart',
    ];

    test.each(locations)('an edited header name is returned for the "%s" location', async (location) => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'athlete', headerNameEditable: true, headerValueGetter: () => 'From Getter' }],
            rowData: [{ athlete: 'Michael Phelps' }],
            initialState: {
                columnHeaderName: { columnHeaderNames: [{ colId: 'athlete', headerName: 'Renamed' }] },
            },
        });
        await asyncSetTimeout(1);

        const column = api.getColumn('athlete') as unknown as AgColumn;
        expect(api.getDisplayNameForColumn(column, location)).toBe('Renamed');
    });
});

describe('Editable header name — row grouping', () => {
    const gridMgr = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => {
        gridMgr.reset();
        vi.resetAllMocks();
    });

    const rowData = [
        { athlete: 'Michael Phelps', country: 'United States' },
        { athlete: 'Ian Thorpe', country: 'Australia' },
    ];

    async function createGrid(): Promise<GridApi> {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'athlete', headerNameEditable: true }, { field: 'country' }],
            rowData,
            defaultColDef: { flex: 1, minWidth: 100 },
        });
        await asyncSetTimeout(1);
        return api;
    }

    test('a renamed leaf column keeps its edited name through a row-group and ungroup cycle', async () => {
        // The override lives on the persistent AgColumn, not on a colDef that grouping regenerates,
        // so grouping by the column and ungrouping again must both preserve the edited name.
        const api = await createGrid();
        const column = api.getColumn('athlete') as unknown as AgColumn;

        api.applyColumnState({ state: [{ colId: 'athlete', headerName: 'Renamed' }] });
        await asyncSetTimeout(1);
        expect(api.getDisplayNameForColumn(column, 'header')).toBe('Renamed');

        api.addRowGroupColumns(['athlete']);
        await asyncSetTimeout(1);
        expect(api.getRowGroupColumns().map((c) => c.getColId())).toEqual(['athlete']);
        expect(api.getDisplayNameForColumn(column, 'header')).toBe('Renamed');

        api.removeRowGroupColumns(['athlete']);
        await asyncSetTimeout(1);
        expect(api.getRowGroupColumns()).toEqual([]);
        expect(api.getDisplayNameForColumn(column, 'header')).toBe('Renamed');
    });

    test('a renamed leaf column that is row-grouped still exports its edited name to grid state', async () => {
        const api = await createGrid();

        api.applyColumnState({ state: [{ colId: 'athlete', headerName: 'Renamed' }] });
        api.addRowGroupColumns(['athlete']);
        await asyncSetTimeout(1);

        expect(api.getState().columnHeaderName?.columnHeaderNames).toEqual([
            { colId: 'athlete', headerName: 'Renamed' },
        ]);
    });
});
