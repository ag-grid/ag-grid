import type { GridApi, GridOptions, MenuItemDef, ShowValueAsConfig } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    TextFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { ColumnMenuModule, ColumnsToolPanelModule, ContextMenuModule, ShowValueAsModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    TextFilterModule,
    NumberFilterModule,
    ColumnMenuModule,
    ContextMenuModule,
    ColumnsToolPanelModule,
    ShowValueAsModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

interface RelativeParams {
    /** colId of the medal column to divide by. */
    base?: string;
    /** Factor applied to the result. */
    multiplier?: number;
}

// A custom "Show Values As" mode: each value as a ratio of another medal column, optionally scaled by a
// multiplier. It supplies its own column-menu submenu via `menu`.
const customConfig: ShowValueAsConfig = {
    modes: {
        relativeValue: {
            displayName: 'Relative Value',
            // The transform reads the chosen base column at this row (`baseColumnValue`) and the multiplier.
            transform: (p) => {
                const { base, multiplier } = (p.params ?? {}) as RelativeParams;
                const value = p.rawValue;
                if (value == null) {
                    return null;
                }
                const factor = multiplier ?? 1;
                if (base) {
                    const baseValue = p.baseColumnValue(base);
                    return baseValue ? (Number(value) / Number(baseValue)) * factor : null;
                }
                return Number(value) * factor;
            },
            // Shows the raw value until a base column or a multiplier is chosen.
            ready: (params: RelativeParams) => params?.base != null || params?.multiplier != null,
            formatter: (p) => (typeof p.value === 'number' ? p.value.toFixed(2) : ''),
            // The submenu is built imperatively, using the same helpers the built-in modes use.
            menu: (p) => {
                const current = p.currentParams as RelativeParams | undefined;
                const items: (MenuItemDef | string)[] = [
                    {
                        name: 'Set multiplier…',
                        // Open the built-in number popup with a custom title/message; commit with `apply`.
                        action: () =>
                            p.editValue((multiplier) => p.apply({ ...current, multiplier }), {
                                value: current?.multiplier,
                                title: 'Relative Value',
                                message: 'Multiply the result by the number below.',
                            }),
                        checked: current?.multiplier != null,
                    },
                ];
                // Offer a column list filtered by your own criteria — here, the medal columns only.
                const medals = p.columnLists.valueColumns.filter((col) =>
                    ['gold', 'silver', 'bronze'].includes(col.getColId())
                );
                if (medals.length) {
                    items.push('separator');
                    for (const col of medals) {
                        const id = col.getColId();
                        items.push({
                            name: `Ratio of ${col.getDisplayName()}`,
                            action: () => p.apply({ ...current, base: id }),
                            checked: current?.base === id,
                        });
                    }
                }
                return items;
            },
        },
    },
};

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'athlete', minWidth: 200 },
        { field: 'country' },
        { field: 'year', filter: 'agNumberColumnFilter' },
        // The custom mode starts active: gold as a ratio of silver.
        { field: 'gold', aggFunc: 'sum', showValueAs: { type: 'relativeValue', params: { base: 'silver' } } },
        { field: 'silver', aggFunc: 'sum' },
        { field: 'bronze', aggFunc: 'sum' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 130,
        enableValue: true,
        filter: true,
        floatingFilter: true,
        // The custom mode is offered on every value column's "Show Values As" submenu.
        showValueAsConfig: customConfig,
    },
    sideBar: 'columns',
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
