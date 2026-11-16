import type { GridOptions } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([AllCommunityModule]);

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'quarter' },
        { field: 'iphone' },
        { field: 'mac' },
        { field: 'ipad' },
        { field: 'wearables' },
        { field: 'services' },
    ],
    rowData: [
        { quarter: "Q1'18", iphone: 140, mac: 16, ipad: 14, wearables: 12, services: 20 },
        { quarter: "Q2'18", iphone: 124, mac: 20, ipad: 14, wearables: 12, services: 30 },
        { quarter: "Q3'18", iphone: 112, mac: 20, ipad: 18, wearables: 14, services: 36 },
        { quarter: "Q4'18", iphone: 118, mac: 24, ipad: 14, wearables: 14, services: 36 },
    ],
};

createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);
