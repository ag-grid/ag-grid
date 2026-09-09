import type { ColDef, ColGroupDef, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import { ColumnMenuModule, ColumnsToolPanelModule } from 'ag-grid-enterprise';

import { CustomColumnLabel } from './customColumnLabel_typescript';

if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnMenuModule, ColumnsToolPanelModule]);

const columnDefs: (ColDef | ColGroupDef)[] = [
    {
        headerName: 'Athlete Details',
        groupId: 'athleteDetails',
        children: [{ field: 'athlete' }, { field: 'country' }, { field: 'sport' }],
    },
    {
        headerName: 'Results',
        groupId: 'results',
        children: [{ field: 'gold' }, { field: 'silver' }, { field: 'bronze' }],
    },
];

const gridOptions: GridOptions = {
    components: {
        customColumnLabel: CustomColumnLabel,
    },
    columnDefs,
    rowData: [
        {
            athlete: 'Michael Phelps',
            country: 'United States',
            sport: 'Swimming',
            gold: 8,
            silver: 0,
            bronze: 0,
        },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 120,
        columnChooserParams: {
            columnLabelRenderer: 'customColumnLabel',
            columnLabelRendererParams: {
                columnIcon: '●',
                columnGroupIcon: '◆',
            },
        },
    },
};

document.addEventListener('DOMContentLoaded', () => {
    createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);
});
