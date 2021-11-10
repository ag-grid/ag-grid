'use strict';

import React, { useMemo, useRef, useEffect, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from '@ag-grid-community/react';
import YearFilter from './yearFilter.jsx';
import YearFloatingFilter from './yearFloatingFilter.jsx';
import MyToolPanel from './myToolPanel.jsx';
import { AllModules } from '@ag-grid-enterprise/all-modules';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-alpine.css';

function GridExample() {

    const gridRef = useRef();

    // never changes, so we can use useMemo
    const columnDefs = useMemo( ()=> [
        { field: 'athlete' },
        { field: 'age', filter: 'agNumberColumnFilter' },
        { field: 'country' },
        { field: 'year', filterFramework: YearFilter, floatingFilter: true, floatingFilterComponentFramework: YearFloatingFilter },
        { field: 'date' },
        { field: 'sport' },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' }
    ], []);

    // never changes, so we can use useMemo
    const defaultColDef = useMemo( ()=> ({
        resizable: true,
        sortable: true,
        filter: true
    }), []);

    // changes, needs to be state
    const [rowData, setRowData] = useState();

    // gets called once, no dependencies, loads the grid data
    useEffect( ()=> {
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then( resp => resp.json())
            .then( data => setRowData(data));
    }, []);

    const sideBar = useMemo( ()=> ({
        toolPanels: [
            'columns',
            'filters',
            {
                id: "myToolPanel",
                labelDefault: "My Tool Panel",
                labelKey: "myToolPanel",
                iconKey: "filter",
                toolPanelFramework: MyToolPanel
            }
        ],
        defaultToolPanel: "myToolPanel"
    }), []);

    const onCallFilter = useCallback( ()=> {
        // because Filter could be crated Async, we use the callback mechanism in the method
        gridRef.current.api.getFilterInstance('year', yearFilter => yearFilter.sampleToggleMethod());
    });

    const onCallToolPanel = useCallback( ()=>
        // tool panels are created up front, so no need for async
        gridRef.current.api.getToolPanelInstance('myToolPanel').sampleToolPanelMethod()
    );

    return (
        <div className='top-level'>
            <div className='buttons-bar'>
                <button onClick={onCallFilter}>Toggle Filter</button>
                <button onClick={onCallToolPanel}>Increment Tool Panel</button>
            </div>
            <AgGridReact 
                // turn on AG Grid React UI
                reactUi="true"

                // reference so we can call the API
                ref={gridRef}

                sideBar={sideBar}

                // all other properties as normal...
                className="ag-theme-alpine my-grid"
                animateRows="true"
                modules={AllModules}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                rowData={rowData}
                />
        </div>
    );
}

render(<GridExample></GridExample>, document.querySelector('#root'));
