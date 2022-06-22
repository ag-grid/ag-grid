import Vue from 'vue';
import { AgGridVue } from '@ag-grid-community/vue';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";
import DaysFrostRenderer from './daysFrostRendererVue.js';

import { ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule]);

/*
* It's unlikely you'll use functions that create and manipulate DOM elements like this in an React application, but it
* demonstrates what is at least possible, and may be preferable in certain use cases
*/
const createImageSpan = (imageMultiplier, image) => {
    const resultElement = document.createElement('span');
    for (let i = 0; i < imageMultiplier; i++) {
        const imageElement = document.createElement('img');
        imageElement.src = 'https://www.ag-grid.com/example-assets/weather/' + image;
        resultElement.appendChild(imageElement);
    }
    return resultElement;
};

// This is a plain JS (not Vue) component
class DeltaIndicator {
    init(params) {
        const element = document.createElement('span');
        const imageElement = document.createElement('img');
        if (params.value > 15) {
            imageElement.src = 'https://www.ag-grid.com/example-assets/weather/fire-plus.png';
        } else {
            imageElement.src = 'https://www.ag-grid.com/example-assets/weather/fire-minus.png';
        }
        element.appendChild(imageElement);
        element.appendChild(document.createTextNode(params.value));
        this.eGui = element;
    }
    getGui() {
        return this.eGui;
    }
}

// This is a plain JS (not Vue) component
class DaysSunshineRenderer {
    init(params) {
        const daysSunshine = params.value / 24;
        this.eGui = createImageSpan(daysSunshine, params.rendererImage);
    }
    getGui() {
        return this.eGui;
    }
}

// This is a plain JS (not Vue) component
class RainPerTenMmRenderer {
    init(params) {
        const rainPerTenMm = params.value / 10;
        this.eGui = createImageSpan(rainPerTenMm, params.rendererImage);
    }
    getGui() {
        return this.eGui;
    }
}

const VueExample = {
    template: `
        <div style="height: 100%">
        <div class="example-wrapper">
            <div style="margin-bottom: 5px;">
                <input type="button" value="Frostier Year" v-on:click="frostierYear(Math.floor(Math.random() * 2) + 1)">
            </div>
            <ag-grid-vue
                    style="width: 100%; height: 100%;"
                    class="ag-theme-alpine"
                    :columnDefs="columnDefs"
                    :rowData="rowData"
                    :defaultColDef="defaultColDef"
                    
                    :components="components"
                    @grid-ready="onGridReady">
            </ag-grid-vue>
        </div>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
        "daysFrostRenderer": DaysFrostRenderer
    },
    data: function () {
        return {
            components: {
                deltaIndicator: DeltaIndicator,
                daysSunshineRenderer: DaysSunshineRenderer,
                rainPerTenMmRenderer: RainPerTenMmRenderer
            },
            gridApi: null,
            columnDefs: [
                {
                    headerName: "Month",
                    field: "Month",
                    width: 75,
                    cellStyle: { color: "darkred" }
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
                    cellRendererParams: { rendererImage: "frost.png" }    // Complementing the Cell Renderer parameters
                },
                {
                    headerName: "Days Sunshine",
                    field: "Sunshine (hours)",
                    width: 190,
                    cellRenderer: "daysSunshineRenderer",
                    cellRendererParams: { rendererImage: "sun.png" }      // Complementing the Cell Renderer parameters
                },
                {
                    headerName: "Rainfall (10mm)",
                    field: "Rainfall (mm)",
                    width: 180,
                    cellRenderer: "rainPerTenMmRenderer",
                    cellRendererParams: { rendererImage: "rain.png" }     // Complementing the Cell Renderer parameters
                }
            ],
            defaultColDef: {
                editable: true,
                sortable: true,
                flex: 1,
                minWidth: 100,
                filter: true,
                resizable: true
            },
            rowData: null
        }
    },
    methods: {
        onGridReady(params) {
            this.gridApi = params.api;

            const updateData = (data) => this.gridApi.setRowData(data);

            fetch('https://www.ag-grid.com/example-assets/weather-se-england.json')
                .then(resp => resp.json())
                .then(data => updateData(data));
        },
        /**
         * Updates the Days of Air Frost column - adjusts the value which in turn will demonstrate the Component refresh functionality
         * After a data update, cellRenderer Components.refresh method will be called to re-render the altered Cells
         */
        frostierYear(extraDaysFrost) {
            // iterate over the rows and make each "days of air frost"
            this.gridApi.forEachNode(rowNode => {
                rowNode.setDataValue('Days of air frost (days)', rowNode.data['Days of air frost (days)'] + extraDaysFrost);
            });
        }
    }
}

new Vue({
    el: '#app',
    components: {
        'my-component': VueExample,
    },
});
