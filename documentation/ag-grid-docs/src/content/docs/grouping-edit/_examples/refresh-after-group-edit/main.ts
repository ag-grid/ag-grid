import type { GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    SelectEditorModule,
    TextEditorModule,
    TextFilterModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

interface Employee {
    id: string;
    department: string;
    team: string;
    name: string;
    role: string;
}

const departments = ['Engineering', 'Sales', 'Marketing'];
const teams: Record<string, string[]> = {
    Engineering: ['Frontend', 'Backend', 'QA'],
    Sales: ['Enterprise', 'SMB', 'Partners'],
    Marketing: ['Content', 'Growth', 'Brand'],
};
const allTeams = Object.values(teams).flat();

function getData(): Employee[] {
    return [
        // Engineering
        { id: '1', department: 'Engineering', team: 'Frontend', name: 'Alice', role: 'Developer' },
        { id: '2', department: 'Engineering', team: 'Frontend', name: 'Bob', role: 'Developer' },
        { id: '3', department: 'Engineering', team: 'Backend', name: 'Carol', role: 'Developer' },
        { id: '4', department: 'Engineering', team: 'Backend', name: 'Dave', role: 'Tech Lead' },
        { id: '5', department: 'Engineering', team: 'QA', name: 'Eve', role: 'Tester' },

        // Sales
        { id: '6', department: 'Sales', team: 'Enterprise', name: 'Frank', role: 'Account Exec' },
        { id: '7', department: 'Sales', team: 'Enterprise', name: 'Grace', role: 'Account Exec' },
        { id: '8', department: 'Sales', team: 'SMB', name: 'Hank', role: 'Sales Rep' },
        { id: '9', department: 'Sales', team: 'Partners', name: 'Ivy', role: 'Partner Manager' },

        // Marketing
        { id: '10', department: 'Marketing', team: 'Content', name: 'Jack', role: 'Writer' },
        { id: '11', department: 'Marketing', team: 'Growth', name: 'Kim', role: 'Analyst' },
        { id: '12', department: 'Marketing', team: 'Brand', name: 'Leo', role: 'Designer' },
    ];
}

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    RowGroupingModule,
    ClientSideRowModelModule,
    TextEditorModule,
    TextFilterModule,
    SelectEditorModule,
]);

const gridOptions: GridOptions<Employee> = {
    columnDefs: [
        {
            field: 'department',
            rowGroup: true,
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: { values: departments },
        },
        {
            field: 'team',
            rowGroup: true,
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: { values: allTeams },
        },
        { field: 'name' },
        { field: 'role', editable: true },
    ],
    defaultColDef: {
        flex: 1,
        sortable: true,
        resizable: true,
        filter: true,
    },
    autoGroupColumnDef: {
        minWidth: 250,
    },
    rowData: getData(),
    refreshAfterGroupEdit: true,
    groupDefaultExpanded: -1,
    animateRows: true,
    getRowId: ({ data }) => data.id,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    createGrid(gridDiv, gridOptions);
});
