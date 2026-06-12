import { getByTestId, waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import { GROUP_AUTO_COLUMN_ID, TooltipModule, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import type { GridOptions, ITooltipComp, ITooltipParams, Module } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

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
        await new GridColumns(api, 'group cell inherits tooltipValueGetter (singleColumn) setup').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── athlete "Athlete" width:200
        `);
        await new GridRows(api, 'group cell inherits tooltipValueGetter (singleColumn) setup').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP collapsed id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
            · └── LEAF hidden id:0 country:"Australia" athlete:"Alice"
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const groupCell = await waitFor(() =>
            getByTestId(gridDiv, agTestIdFor.autoGroupCell('row-group-country-Australia'))
        );

        await userEvent.hover(groupCell);
        await asyncSetTimeout(TOOLTIP_SHOW_DELAY + 50);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Tooltip: Australia');
        await new GridRows(api, 'group cell inherits tooltipValueGetter (singleColumn) final state').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP collapsed id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
            · └── LEAF hidden id:0 country:"Australia" athlete:"Alice"
        `);
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
        await new GridColumns(api, 'group cell inherits tooltipValueGetter (multipleColumns) setup').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn-country "Country" width:200
            └── athlete "Athlete" width:200
        `);
        await new GridRows(api, 'group cell inherits tooltipValueGetter (multipleColumns) setup').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null
            └─┬ LEAF_GROUP collapsed id:row-group-country-Australia ag-Grid-AutoColumn-country:"Australia"
            · └── LEAF hidden id:0 country:"Australia" athlete:"Alice"
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const autoColId = `${GROUP_AUTO_COLUMN_ID}-country`;
        const groupCell = await waitFor(() =>
            getByTestId(gridDiv, agTestIdFor.cell('row-group-country-Australia', autoColId))
        );

        await userEvent.hover(groupCell);
        await asyncSetTimeout(TOOLTIP_SHOW_DELAY + 50);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Country: Australia');
        await new GridRows(api, 'group cell inherits tooltipValueGetter (multipleColumns) final state').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null
            └─┬ LEAF_GROUP collapsed id:row-group-country-Australia ag-Grid-AutoColumn-country:"Australia"
            · └── LEAF hidden id:0 country:"Australia" athlete:"Alice"
        `);
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
        await new GridColumns(api, 'group cell inherits tooltipField setup').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── athlete "Athlete" width:200
        `);
        await new GridRows(api, 'group cell inherits tooltipField setup').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP collapsed id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
            · └── LEAF hidden id:0 country:"Australia" athlete:"Alice"
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const groupCell = await waitFor(() =>
            getByTestId(gridDiv, agTestIdFor.autoGroupCell('row-group-country-Australia'))
        );

        await userEvent.hover(groupCell);
        await asyncSetTimeout(TOOLTIP_SHOW_DELAY + 50);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Australia');
        await new GridRows(api, 'group cell inherits tooltipField final state').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP collapsed id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
            · └── LEAF hidden id:0 country:"Australia" athlete:"Alice"
        `);
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
        await new GridColumns(api, 'grouped header inherits headerTooltip (multipleColumns) setup').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn-country "Country" width:200
            └── athlete "Athlete" width:200
        `);
        await new GridRows(api, 'grouped header inherits headerTooltip (multipleColumns) setup').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null
            └─┬ LEAF_GROUP collapsed id:row-group-country-Australia ag-Grid-AutoColumn-country:"Australia"
            · └── LEAF hidden id:0 country:"Australia" athlete:"Alice"
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const autoColId = `${GROUP_AUTO_COLUMN_ID}-country`;
        const headerCell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.headerCell(autoColId)));

        await userEvent.hover(headerCell);
        await asyncSetTimeout(TOOLTIP_SHOW_DELAY + 50);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Country header tooltip');
        await new GridRows(api, 'grouped header inherits headerTooltip (multipleColumns) final state').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null
            └─┬ LEAF_GROUP collapsed id:row-group-country-Australia ag-Grid-AutoColumn-country:"Australia"
            · └── LEAF hidden id:0 country:"Australia" athlete:"Alice"
        `);
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
        await new GridColumns(api, 'leaf rows use autoGroupColumnDef tooltipValueGetter setup').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── athlete "Athlete" width:200
        `);
        await new GridRows(api, 'leaf rows use autoGroupColumnDef tooltipValueGetter setup').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP collapsed id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
            · └── LEAF hidden id:0 ag-Grid-AutoColumn:"Alice" country:"Australia" athlete:"Alice"
        `);

        api.setRowNodeExpanded(api.getRowNode('row-group-country-Australia')!, true);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const leafCell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.autoGroupCell('0')));

        await userEvent.hover(leafCell);
        await asyncSetTimeout(TOOLTIP_SHOW_DELAY + 50);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Leaf: Alice');
        await new GridRows(api, 'leaf rows use autoGroupColumnDef tooltipValueGetter final state').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
            · └── LEAF id:0 ag-Grid-AutoColumn:"Alice" country:"Australia" athlete:"Alice"
        `);
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
        await new GridColumns(api, 'group rows use underlying colDef tooltip setup').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── athlete "Athlete" width:200
        `);
        await new GridRows(api, 'group rows use underlying colDef tooltip setup').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP collapsed id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
            · └── LEAF hidden id:0 country:"Australia" athlete:"Alice"
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const groupCell = await waitFor(() =>
            getByTestId(gridDiv, agTestIdFor.autoGroupCell('row-group-country-Australia'))
        );

        await userEvent.hover(groupCell);
        await asyncSetTimeout(TOOLTIP_SHOW_DELAY + 50);
        await waitForTooltips(1);
        expect(getTooltips()[0]).toHaveTextContent('Inherited tooltip');
        await new GridRows(api, 'group rows use underlying colDef tooltip final state').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP collapsed id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
            · └── LEAF hidden id:0 country:"Australia" athlete:"Alice"
        `);
    });

    // tooltipComponentSelector is inherited by the auto group column (multipleColumns)
    test('group column inherits tooltipComponentSelector (multipleColumns)', async () => {
        class CustomTooltip implements ITooltipComp {
            private eGui!: HTMLElement;
            init(params: ITooltipParams) {
                this.eGui = document.createElement('div');
                this.eGui.className = 'ag-tooltip-custom custom-selector-tooltip';
                this.eGui.textContent = `selector:${params.value}`;
            }
            getGui() {
                return this.eGui;
            }
        }

        const gridOptions: GridOptions = {
            columnDefs: [
                {
                    field: 'country',
                    rowGroup: true,
                    hide: true,
                    tooltipValueGetter: (params) => params.value,
                    tooltipComponentSelector: () => ({ component: CustomTooltip }),
                },
                { field: 'athlete' },
            ],
            rowData: [{ country: 'Australia', athlete: 'Alice' }],
            groupDisplayType: 'multipleColumns',
            tooltipShowDelay: TOOLTIP_SHOW_DELAY,
        };

        const api = await gridMgr.createGridAndWait('tooltip-group-selector-multiple', gridOptions);
        await new GridColumns(api, 'group column inherits tooltipComponentSelector (multipleColumns) setup')
            .checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn-country "Country" width:200
            └── athlete "Athlete" width:200
        `);
        await new GridRows(api, 'group column inherits tooltipComponentSelector (multipleColumns) setup').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null
            └─┬ LEAF_GROUP collapsed id:row-group-country-Australia ag-Grid-AutoColumn-country:"Australia"
            · └── LEAF hidden id:0 country:"Australia" athlete:"Alice"
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const autoColId = `${GROUP_AUTO_COLUMN_ID}-country`;
        const groupCell = await waitFor(() =>
            getByTestId(gridDiv, agTestIdFor.cell('row-group-country-Australia', autoColId))
        );

        await userEvent.hover(groupCell);
        await asyncSetTimeout(TOOLTIP_SHOW_DELAY + 50);
        await waitForTooltips(1);
        expect(document.querySelector('.custom-selector-tooltip')).not.toBeNull();
        expect(getTooltips()[0]).toHaveTextContent('selector:Australia');
        await new GridRows(api, 'group column inherits tooltipComponentSelector (multipleColumns) final state').check(
            `
                ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null
                └─┬ LEAF_GROUP collapsed id:row-group-country-Australia ag-Grid-AutoColumn-country:"Australia"
                · └── LEAF hidden id:0 country:"Australia" athlete:"Alice"
            `
        );
    });

    // tooltipComponentSelector on the source column is dispatched in singleColumn mode
    test('group cell uses tooltipComponentSelector from source column (singleColumn)', async () => {
        class CustomTooltip implements ITooltipComp {
            private eGui!: HTMLElement;
            init(params: ITooltipParams) {
                this.eGui = document.createElement('div');
                this.eGui.className = 'ag-tooltip-custom custom-selector-tooltip';
                this.eGui.textContent = `selector:${params.value}`;
            }
            getGui() {
                return this.eGui;
            }
        }

        const gridOptions: GridOptions = {
            columnDefs: [
                {
                    field: 'country',
                    rowGroup: true,
                    hide: true,
                    tooltipValueGetter: (params) => params.value,
                    tooltipComponentSelector: () => ({ component: CustomTooltip }),
                },
                { field: 'athlete' },
            ],
            rowData: [{ country: 'Australia', athlete: 'Alice' }],
            tooltipShowDelay: TOOLTIP_SHOW_DELAY,
        };

        const api = await gridMgr.createGridAndWait('tooltip-group-selector-single', gridOptions);
        await new GridColumns(api, 'group cell uses tooltipComponentSelector from source column (singleColumn) setup')
            .checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── athlete "Athlete" width:200
        `);
        await new GridRows(api, 'group cell uses tooltipComponentSelector from source column (singleColumn) setup')
            .check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP collapsed id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
            · └── LEAF hidden id:0 country:"Australia" athlete:"Alice"
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const groupCell = await waitFor(() =>
            getByTestId(gridDiv, agTestIdFor.autoGroupCell('row-group-country-Australia'))
        );

        await userEvent.hover(groupCell);
        await asyncSetTimeout(TOOLTIP_SHOW_DELAY + 50);
        await waitForTooltips(1);
        expect(document.querySelector('.custom-selector-tooltip')).not.toBeNull();
        expect(getTooltips()[0]).toHaveTextContent('selector:Australia');
        await new GridRows(
            api,
            'group cell uses tooltipComponentSelector from source column (singleColumn) final state'
        ).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP collapsed id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
            · └── LEAF hidden id:0 country:"Australia" athlete:"Alice"
        `);
    });
});
