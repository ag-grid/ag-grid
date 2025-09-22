import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    ModuleRegistry,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import {
    ColumnsToolPanelModule,
    PivotModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    SideBarModule,
} from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    RowGroupingModule,
    SideBarModule,
    ColumnsToolPanelModule,
    RowGroupingPanelModule,
    ColumnApiModule,
    PivotModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        {
            field: 'date',
            rowGroup: true,
            enableRowGroup: true,
            enablePivot: true,
            groupHierarchy: ['year', 'week'],
        },
        { field: 'country' },
        { field: 'sport' },
        { field: 'total', aggFunc: 'sum' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    autoGroupColumnDef: {
        minWidth: 200,
    },
    sideBar: 'columns',
    rowGroupPanelShow: 'always',
    groupHierarchyConfig: {
        week: {
            headerValueGetter: (params) => {
                const sourceCol = params.api.getColumns()?.find((col) => col.getColDef().field === 'date');
                if (!sourceCol) return '';

                const name = params.api.getDisplayNameForColumn(sourceCol, params.location);

                return `${name} (Week)`;
            },
            valueGetter: (params) => {
                const sourceCol = params.api.getColumns()?.find((col) => col.getColDef().field === 'date');

                const field = sourceCol?.getColDef().field;
                if (!field) return;

                const value = params.getValue(field);
                const date = getDate(value);
                if (!date) return;

                return getWeekNumber(date).toString();
            },
        },
    },
};

function getDate(value: any): Date | null {
    if (value instanceof Date) {
        return value;
    }
    if (typeof value === 'string') {
        const [year, month, day] = value.split('-');
        const d = new Date();
        d.setFullYear(parseInt(year, 10), parseInt(month, 10), parseInt(day, 10));
        d.setHours(0, 0, 0, 0);
        return d;
    }
    return null;
}

function getWeekNumber(date: Date): number {
    const d = new Date(date.getTime());
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((date.getDay() + 6) % 7));
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) =>
            gridApi!.setGridOption(
                'rowData',
                data.map((d) => ({
                    ...d,
                    date: d.date?.split('/').reverse().join('-'),
                }))
            )
        );
});
