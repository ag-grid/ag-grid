import {Component} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AllCommunityModules, GridApi, Module, RowNode} from '@ag-grid-community/all-modules';
import '@ag-grid-community/all-modules/dist/styles/ag-grid.css';
import "@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css";
import {DaysFrostRenderer} from './days-frost-renderer.component';

/*
* It's unlikely you'll use functions that create and manipulate DOM elements like this in an Angular application, but it
* demonstrates what is at least possible, and may be preferable in certain use cases
*/
const createImageSpan = (imageMultiplier: number, image: string) => {
    const resultElement = document.createElement('span');
    for (let i = 0; i < imageMultiplier; i++) {
        const imageElement = document.createElement('img');
        imageElement.src = 'https://www.ag-grid.com/example-assets/weather/' + image;
        resultElement.appendChild(imageElement);
    }
    return resultElement;
};
const deltaIndicator = (params: any) => {
    const element = document.createElement('span');
    const imageElement = document.createElement('img');
    if (params.value > 15) {
        imageElement.src = 'https://www.ag-grid.com/example-assets/weather/fire-plus.png';
    } else {
        imageElement.src = 'https://www.ag-grid.com/example-assets/weather/fire-minus.png';
    }
    element.appendChild(imageElement);
    element.appendChild(document.createTextNode(params.value));
    return element;
};
const daysSunshineRenderer = (params: any) => {
    const daysSunshine = params.value / 24;
    return createImageSpan(daysSunshine, params.rendererImage);
};
const rainPerTenMmRenderer = (params: any) => {
    const rainPerTenMm = params.value / 10;
    return createImageSpan(rainPerTenMm, params.rendererImage);
};

@Component({
    selector: 'my-app',
    template: `
        <div class="example-wrapper">
        <div style="margin-bottom: 5px;">
            <input type="button" value="Frostier Year" (click)="frostierYear()">
        </div>
        <ag-grid-angular
                #agGrid
                style="width: 100%; height: 100%;"
                class="ag-theme-alpine"
                [modules]="modules"
                [columnDefs]="columnDefs"
                [rowData]="rowData"
                [components]="components"
                [frameworkComponents]="frameworkComponents"
                [defaultColDef]="defaultColDef"
                (gridReady)="onGridReady($event)"
        ></ag-grid-angular>
        </div>
    `
})

export class AppComponent {
    private gridApi: GridApi;

    public modules: Module[] = AllCommunityModules;

    private columnDefs = [
        {
            headerName: "Month",
            field: "Month",
            width: 75,
            cellStyle: {color: "darkred"}
        },
        {
            headerName: "Max Temp (\u02DAC)",
            field: "Max temp (C)",
            width: 120,
            cellRenderer: "deltaIndicator"
        },
        {
            headerName: "Min Temp (\u02DAC)",
            field: "Min temp (C)",
            width: 120,
            cellRenderer: "deltaIndicator"
        },
        {
            headerName: "Days of Air Frost",
            field: "Days of air frost (days)",
            width: 233,
            cellRenderer: "daysFrostRenderer",
            cellRendererParams: {rendererImage: "frost.png"}
        },
        {
            headerName: "Days Sunshine",
            field: "Sunshine (hours)",
            width: 190,
            cellRenderer: "daysSunshineRenderer",
            cellRendererParams: {rendererImage: "sun.png"}
        },
        {
            headerName: "Rainfall (10mm)",
            field: "Rainfall (mm)",
            width: 180,
            cellRenderer: "rainPerTenMmRenderer",
            cellRendererParams: {rendererImage: "rain.png"}
        }
    ];

    private frameworkComponents: {};
    private components: {};

    private defaultColDef: {
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        resizable: true
    };

    private rowData: []

    constructor(private http: HttpClient) {
        this.components = {
            'deltaIndicator': deltaIndicator,
            'daysSunshineRenderer': daysSunshineRenderer,
            'rainPerTenMmRenderer': rainPerTenMmRenderer
        };
        this.frameworkComponents = {
            'daysFrostRenderer': DaysFrostRenderer,
        }
    }

    /**
     * Updates the Days of Air Frost column - adjusts the value which in turn will demonstrate the Component refresh functionality
     * After a data update, cellRenderer Components.refresh method will be called to re-render the altered Cells
     */
    frostierYear() {
        const extraDaysFrost = Math.floor(Math.random() * 2) + 1;

        // iterate over the rows and make each "days of air frost"
        this.gridApi.forEachNode((rowNode: RowNode) => {
            rowNode.setDataValue('Days of air frost (days)', rowNode.data['Days of air frost (days)'] + extraDaysFrost);
        });
    }

    onGridReady(params: any) {
        this.gridApi = params.api;

        this.http.get('https://www.ag-grid.com/example-assets/weather-se-england.json').subscribe(data => params.api.setRowData(data));
    }
}


