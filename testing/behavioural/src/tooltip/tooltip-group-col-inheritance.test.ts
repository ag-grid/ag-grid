import { getByTestId, waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import { GROUP_AUTO_COLUMN_ID, TooltipModule, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import type { GridOptions, Module } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('Tooltip inheritance in group columns', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [TooltipModule, RowGroupingModule] as Module[],
    });

    beforeAll(() => setupAgTestIds());
    afterEach(() => gridMgr.reset());

    const TOOLTIP_SHOW_DELAY = 200;

    const getTooltips = () => Array.from(document.querySelectorAll<HTMLElement>('.ag-tooltip, .ag-tooltip-custom'));
    const waitForTooltips = async (count: number) =>
        await waitFor(() => expect(getTooltips().length).toBe(count), { timeout: 2000 });

    // TC2 – single column grouping: group cell inherits tooltipValueGetter from underlying colDef
    test('group cell inherits tooltipValueGetter when grouped (singleColumn)', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                {
                    field: 'country',
                    rowGroup: true,
                    hide: true,
                    tooltipValueGetter: (params) => `Tooltip: ${params.value}`,
                },
                { field: 'athlete' },
            ],
            rowData: [{ country: 'Australia', athlete: 'Alice' }],
            tooltipShowDelay: TOOLTIP_SHOW_DELAY,
        };

        const api = await gridMgr.createGridAndWait('tooltip-group-single', gridOptions);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const groupCell = await waitFor(() =>
            getByTestId(gridDiv, agTestIdFor.autoGroupCell('row-group-country-Australia'))
        );

        await userEvent.hover(groupCell);
        await asyncSetTimeout(TOOLTIP_SHOW_DELAY + 50);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Tooltip: Australia');
    });

    // TC2 – multiple column grouping: group cell inherits tooltipValueGetter from underlying colDef
    test('group cell inherits tooltipValueGetter when grouped (multipleColumns)', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                {
                    field: 'country',
                    rowGroup: true,
                    hide: true,
                    tooltipValueGetter: (params) => `Country: ${params.value}`,
                },
                { field: 'athlete' },
            ],
            rowData: [{ country: 'Australia', athlete: 'Alice' }],
            groupDisplayType: 'multipleColumns',
            tooltipShowDelay: TOOLTIP_SHOW_DELAY,
        };

        const api = await gridMgr.createGridAndWait('tooltip-group-multiple', gridOptions);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const autoColId = `${GROUP_AUTO_COLUMN_ID}-country`;
        const groupCell = await waitFor(() =>
            getByTestId(gridDiv, agTestIdFor.cell('row-group-country-Australia', autoColId))
        );

        await userEvent.hover(groupCell);
        await asyncSetTimeout(TOOLTIP_SHOW_DELAY + 50);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Country: Australia');
    });

    // TC2 – tooltipField is inherited (singleColumn)
    test('group cell inherits tooltipField from underlying colDef', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true, tooltipField: 'country' },
                { field: 'athlete' },
            ],
            rowData: [{ country: 'Australia', athlete: 'Alice' }],
            tooltipShowDelay: TOOLTIP_SHOW_DELAY,
        };

        const api = await gridMgr.createGridAndWait('tooltip-group-field', gridOptions);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const groupCell = await waitFor(() =>
            getByTestId(gridDiv, agTestIdFor.autoGroupCell('row-group-country-Australia'))
        );

        await userEvent.hover(groupCell);
        await asyncSetTimeout(TOOLTIP_SHOW_DELAY + 50);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Australia');
    });

    // TC4 – grouped header inherits headerTooltip from underlying colDef (multipleColumns)
    test('grouped header inherits headerTooltip from underlying colDef (multipleColumns)', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true, headerTooltip: 'Country header tooltip' },
                { field: 'athlete' },
            ],
            rowData: [{ country: 'Australia', athlete: 'Alice' }],
            groupDisplayType: 'multipleColumns',
            tooltipShowDelay: TOOLTIP_SHOW_DELAY,
        };

        const api = await gridMgr.createGridAndWait('tooltip-group-header', gridOptions);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const autoColId = `${GROUP_AUTO_COLUMN_ID}-country`;
        const headerCell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.headerCell(autoColId)));

        await userEvent.hover(headerCell);
        await asyncSetTimeout(TOOLTIP_SHOW_DELAY + 50);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Country header tooltip');
    });

    // TC5 – leaf rows in the group column use autoGroupColumnDef tooltip settings
    test('leaf rows use autoGroupColumnDef tooltipValueGetter', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: {
                field: 'athlete',
                tooltipValueGetter: (params) => `Leaf: ${params.value}`,
            },
            rowData: [{ country: 'Australia', athlete: 'Alice' }],
            tooltipShowDelay: TOOLTIP_SHOW_DELAY,
        };

        const api = await gridMgr.createGridAndWait('tooltip-group-leaf', gridOptions);

        api.setRowNodeExpanded(api.getRowNode('row-group-country-Australia')!, true);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const leafCell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.autoGroupCell('0')));

        await userEvent.hover(leafCell);
        await asyncSetTimeout(TOOLTIP_SHOW_DELAY + 50);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Leaf: Alice');
    });

    // group rows always use underlying colDef tooltip even when autoGroupColumnDef also sets one
    test('group rows use underlying colDef tooltip, ignoring autoGroupColumnDef tooltipValueGetter', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                {
                    field: 'country',
                    rowGroup: true,
                    hide: true,
                    tooltipValueGetter: () => 'Inherited tooltip',
                },
                { field: 'athlete' },
            ],
            autoGroupColumnDef: {
                tooltipValueGetter: () => 'autoGroupColumnDef tooltip',
            },
            rowData: [{ country: 'Australia', athlete: 'Alice' }],
            tooltipShowDelay: TOOLTIP_SHOW_DELAY,
        };

        const api = await gridMgr.createGridAndWait('tooltip-group-override', gridOptions);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const groupCell = await waitFor(() =>
            getByTestId(gridDiv, agTestIdFor.autoGroupCell('row-group-country-Australia'))
        );

        await userEvent.hover(groupCell);
        await asyncSetTimeout(TOOLTIP_SHOW_DELAY + 50);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Inherited tooltip');
    });
});
