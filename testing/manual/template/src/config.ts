import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import type { ColDef, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

export interface IOlympicData {
    athlete: string;
    age: number;
    country: string;
    year: number;
    date: string;
    sport: string;
    gold: number;
    silver: number;
    bronze: number;
    total: number;
}

const columnDefs: ColDef<IOlympicData>[] = [
    { field: 'athlete' },
    { field: 'age' },
    { field: 'country' },
    { field: 'year' },
    { field: 'date' },
    { field: 'sport' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
];

export const gridOptions: GridOptions<IOlympicData> = {
    columnDefs,
    sideBar: true,
    onGridReady: (event: GridReadyEvent<IOlympicData>) => {
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then((response) => response.json())
            .then((data: IOlympicData[]) => event.api.setGridOption('rowData', data));
    },
};
