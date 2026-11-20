import type { GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    TooltipModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([TooltipModule, ClientSideRowModelModule]);

const gridOptions: GridOptions = {
    columnDefs: [{ field: 'athlete' }, { field: 'country' }, { field: 'sport' }],
    defaultColDef: {
        flex: 1,
        minWidth: 120,
        tooltip: true,
        headerTooltip: true,
    },
    rowData: [
        { athlete: 'Michael Phelps', country: 'United States', sport: 'Swimming' },
        { athlete: 'Usain Bolt', country: 'Jamaica', sport: 'Athletics' },
        { athlete: 'Simone Biles', country: 'United States', sport: 'Gymnastics' },
    ],
    tooltipTrigger: 'hoverOrFocus',
    tooltipShowDelay: 500,
};

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    createGrid(gridDiv, gridOptions);
});
