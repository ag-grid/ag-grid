import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';
import type { IOverlayParams } from 'ag-grid-community';

import { CustomLoadingOverlay } from './customLoadingOverlay_typescript';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

interface IAthlete {
    athlete: string;
    country: string;
}

const columnDefs: ColDef[] = [{ field: 'athlete' }, { field: 'country' }];

const rowData: IAthlete[] = [];

let gridApi: GridApi<IAthlete>;

const gridOptions: GridOptions<IAthlete> = {
    defaultColDef: {
        flex: 1,
    },

    loading: true,

    columnDefs: columnDefs,
    rowData,

    overlayComponentSelector: (params: IOverlayParams) => {
        if (params.overlayType === 'loading') {
            return {
                component: CustomLoadingOverlay,
                params: {
                    loadingMessage: 'Please wait while data is loading...',
                },
            };
        }
        // return undefined to use the provided overlay for other overlay types
        return undefined;
    },
};

function setLoading(value: boolean) {
    gridApi!.setGridOption('loading', value);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
