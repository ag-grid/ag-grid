import type { GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    SelectEditorModule,
    TextEditorModule,
    TextFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

type Region = 'East' | 'West' | 'North' | 'South';

export interface GroupAssignment {
    id: string;
    region: Region;
    owner: string;
}

function getData(): GroupAssignment[] {
    return [
        { id: 'g1', region: 'East', owner: 'Jamie' },
        { id: 'g2', region: 'East', owner: 'Kira' },
        { id: 'g3', region: 'East', owner: 'Lena' },
        { id: 'g4', region: 'West', owner: 'Marco' },
        { id: 'g5', region: 'West', owner: 'Gus' },
        { id: 'g6', region: 'North', owner: 'Olive' },
        { id: 'g7', region: 'North', owner: 'Seth' },
        { id: 'g8', region: 'South', owner: 'Tara' },
        { id: 'g9', region: 'South', owner: 'Uma' },
    ];
}

ModuleRegistry.registerModules([
    RowGroupingModule,
    ClientSideRowModelModule,
    TextEditorModule,
    TextFilterModule,
    SelectEditorModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

const gridOptions: GridOptions<GroupAssignment> = {
    columnDefs: [
        {
            field: 'region',
            headerName: 'Region',
            rowGroup: true,
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: { values: ['East', 'West', 'North', 'South'] },
        },
        { field: 'owner' },
    ],
    defaultColDef: {
        sortable: true,
        resizable: true,
        filter: true,
    },
    autoGroupColumnDef: {
        minWidth: 220,
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
