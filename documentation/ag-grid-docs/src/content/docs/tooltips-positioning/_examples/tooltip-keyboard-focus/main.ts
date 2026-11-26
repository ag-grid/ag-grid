import type { GridApi, GridOptions } from 'ag-grid-community';
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

let gridApi: GridApi;

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
    tooltipShowMode: 'standard',
    tooltipShowDelay: 500,
    tooltipAnchor: 'target',
    tooltipOffset: 6,
};

function onPositionChanged() {
    const position = document.querySelector<HTMLSelectElement>('#position')!.value;
    gridApi.setGridOption(
        'tooltipPosition',
        position === 'default' ? undefined : (position as GridOptions['tooltipPosition'])
    );
}

function onAnchorChanged() {
    const anchor = document.querySelector<HTMLSelectElement>('#anchor')!.value as GridOptions['tooltipAnchor'];
    gridApi.setGridOption('tooltipAnchor', anchor);
}

function onOffsetChanged() {
    gridApi.setGridOption('tooltipOffset', Number(document.querySelector<HTMLInputElement>('#offset')!.value));
}

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
