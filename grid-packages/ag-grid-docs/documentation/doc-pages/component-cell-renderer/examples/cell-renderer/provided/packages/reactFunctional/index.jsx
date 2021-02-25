'use strict'

import React, {useState} from 'react';
import {render} from 'react-dom';
import {AgGridColumn, AgGridReact} from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import DaysFrostRenderer from './daysFrostRenderer.jsx';

/*
* It's unlikely you'll use functions that create and manipulate DOM elements like this in a React application, but it
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
const deltaIndicator = params => {
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
const daysSunshineRenderer = params => {
    const daysSunshine = params.value / 24;
    return createImageSpan(daysSunshine, params.rendererImage);
};
const rainPerTenMmRenderer = params => {
    const rainPerTenMm = params.value / 10;
    return createImageSpan(rainPerTenMm, params.rendererImage);
};

const GridExample = () => {
    const [gridApi, setGridApi] = useState(null);
    const [rowData, setRowData] = useState(null);

    const onGridReady = (params) => {
        setGridApi(params.api);

        const updateData = (data) => params.api.setRowData(data);

        fetch('https://www.ag-grid.com/example-assets/weather-se-england.json')
            .then(resp => resp.json())
            .then(data => updateData(data));
    }

    /**
     * Updates the Days of Air Frost column - adjusts the value which in turn will demonstrate the Component refresh functionality
     * After a data update, cellRenderer Components.refresh method will be called to re-render the altered Cells
     */
    const frostierYear = () => {
        const extraDaysFrost = Math.floor(Math.random() * 2) + 1;

        // iterate over the rows and make each "days of air frost"
        gridApi.forEachNode(rowNode => {
            rowNode.setDataValue('Days of air frost (days)', rowNode.data['Days of air frost (days)'] + extraDaysFrost);
        });
    }

    return (
        <div style={{width: '100%', height: '100%'}}>
            <div className="example-wrapper">
                <div style={{"marginBottom": "5px"}}>
                    <input type="button" value="Frostier Year"
                           onClick={() => frostierYear(Math.floor(Math.random() * 2) + 1)}/>
                </div>

                <div
                    id="myGrid"
                    style={{
                        height: '100%',
                        width: '100%'
                    }}
                    className="ag-theme-alpine">
                    <AgGridReact
                        rowData={rowData}
                        components={{
                            deltaIndicator: deltaIndicator,
                            daysSunshineRenderer: daysSunshineRenderer,
                            rainPerTenMmRenderer: rainPerTenMmRenderer
                        }}
                        frameworkComponents={{
                            "daysFrostRenderer": DaysFrostRenderer,
                        }}
                        defaultColDef={{
                            editable: true,
                            sortable: true,
                            flex: 1,
                            minWidth: 100,
                            filter: true,
                            resizable: true
                        }}
                        onGridReady={onGridReady}>
                        <AgGridColumn headerName="Month" field="Month" width={75} cellStyle={{"color": "darkred"}}/>
                        <AgGridColumn headerName="Max Temp (˚C)" field="Max temp (C)" width={120}
                                      cellRenderer="deltaIndicator"/>
                        <AgGridColumn headerName="Min Temp (˚C)" field="Min temp (C)" width={120}
                                      cellRenderer="deltaIndicator"/>
                        <AgGridColumn headerName="Days of Air Frost" field="Days of air frost (days)" width={233}
                                      cellRenderer="daysFrostRenderer"
                                      cellRendererParams={{"rendererImage": "frost.png"}}/>
                        <AgGridColumn headerName="Days Sunshine" field="Sunshine (hours)" width={190}
                                      cellRenderer="daysSunshineRenderer"
                                      cellRendererParams={{"rendererImage": "sun.png"}}/>
                        <AgGridColumn headerName="Rainfall (10mm)" field="Rainfall (mm)" width={180}
                                      cellRenderer="rainPerTenMmRenderer"
                                      cellRendererParams={{"rendererImage": "rain.png"}}/>
                    </AgGridReact>
                </div>
            </div>
        </div>
    );
}

render(<GridExample></GridExample>, document.querySelector('#root'))
