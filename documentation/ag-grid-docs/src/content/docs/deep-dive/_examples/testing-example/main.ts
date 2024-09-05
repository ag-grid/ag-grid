import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import {
    CellValueChangedEvent,
    ColDef,
    GridApi,
    GridOptions,
    ICellRendererComp,
    ICellRendererParams,
    SelectionChangedEvent,
    ValueFormatterParams,
    createGrid,
} from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

// Grid API: Access to Grid API methods
let gridApi: GridApi;

const dateFormatter = (params: ValueFormatterParams) => {
    return new Date(params.value).toLocaleDateString('en-us', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

class CompanyLogoRenderer implements ICellRendererComp {
    eGui!: HTMLSpanElement;

    // Optional: Params for rendering. The same params that are passed to the cellRenderer function.
    init(params: ICellRendererParams) {
        let companyLogo: HTMLImageElement = document.createElement('img');
        companyLogo.src = `https://www.ag-grid.com/example-assets/space-company-logos/${params.value.toLowerCase()}.png`;
        companyLogo.setAttribute(
            'style',
            'display: block; width: 25px; height: auto; max-height: 50%; margin-right: 12px; filter: brightness(1.1)'
        );

        let companyName: HTMLParagraphElement = document.createElement('p');
        companyName.textContent = params.value;
        companyName.setAttribute('style', 'text-overflow: ellipsis; overflow: hidden; white-space: nowrap;');

        this.eGui = document.createElement('span');
        this.eGui.setAttribute('style', 'display: flex; height: 100%; width: 100%; align-items: center');
        this.eGui.appendChild(companyLogo);
        this.eGui.appendChild(companyName);
    }

    // Required: Return the DOM element of the component, this is what the grid puts into the cell
    getGui() {
        return this.eGui;
    }

    // Required: Get the cell to refresh.
    refresh(params: ICellRendererParams): boolean {
        return false;
    }
}

class MissionResultRenderer implements ICellRendererComp {
    eGui!: HTMLSpanElement;

    // Optional: Params for rendering. The same params that are passed to the cellRenderer function.
    init(params: ICellRendererParams) {
        let icon: HTMLImageElement = document.createElement('img');
        icon.src = `https://www.ag-grid.com/example-assets/icons/${params.value ? 'tick-in-circle' : 'cross-in-circle'}.png`;
        icon.setAttribute('style', 'width: auto; height: auto;');

        this.eGui = document.createElement('span');
        this.eGui.setAttribute('style', 'display: flex; justify-content: center; height: 100%; align-items: center');
        this.eGui.appendChild(icon);
    }

    // Required: Return the DOM element of the component, this is what the grid puts into the cell
    getGui() {
        return this.eGui;
    }

    // Required: Get the cell to refresh.
    refresh(params: ICellRendererParams): boolean {
        return false;
    }
}

// Row Data Interface
interface IRow {
    mission: string;
    company: string;
    location: string;
    date: string;
    time: string;
    rocket: string;
    price: number;
    successful: boolean;
}

const gridOptions: GridOptions = {
    // Data to be displayed
    rowData: [] as IRow[],
    // Columns to be displayed (Should match rowData properties)
    columnDefs: [
        {
            field: 'mission',
            width: 150,
        },
        {
            field: 'company',
            width: 130,
            cellRenderer: CompanyLogoRenderer,
        },
        {
            field: 'location',
            width: 225,
        },
        {
            field: 'date',
            valueFormatter: dateFormatter,
        },
        {
            field: 'price',
            width: 130,
            valueFormatter: (params: ValueFormatterParams) => {
                return '£' + params.value.toLocaleString();
            },
        },
        {
            field: 'successful',
            width: 120,
            cellRenderer: MissionResultRenderer,
        },
        { field: 'rocket' },
    ] as ColDef[],
    // Configurations applied to all columns
    defaultColDef: {
        filter: true,
        editable: true,
    } as ColDef,
    // Grid Options & Callbacks
    pagination: true,
    selection: { mode: 'multiRow', headerCheckbox: false },
    onSelectionChanged: (event: SelectionChangedEvent) => {
        console.log('Row Selection Event!');
    },
    onCellValueChanged: (event: CellValueChangedEvent) => {
        console.log(`New Cell Value: ${event.value}`);
    },
};

// Create Grid: Create new grid within the #myGrid div, using the Grid Options object
gridApi = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);

// Fetch Remote Data
fetch('https://www.ag-grid.com/example-assets/space-mission-data.json')
    .then((response) => response.json())
    .then((data: any) => gridApi.setGridOption('rowData', data));
