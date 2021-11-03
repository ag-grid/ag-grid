'use strict';

import React, { useMemo, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-alpine.css';

const YearFilter = forwardRef((props, ref) => {
    const [year, setYear] = useState('All');
 
    // expose AG Grid Filter Lifecycle callbacks
    useImperativeHandle(ref, () => {
        return {
            doesFilterPass(params) {
                return params.data.year >= 2010;
            },
 
            isFilterActive() {
                return year === '2010'
            },
 
            // this example isn't using getModel() and setModel(),
            // so safe to just leave these empty. don't do this in your code!!!
            getModel() {
            },
 
            setModel() {
            }
        }
    });
 
    const onYearChange = event => {
        setYear(event.target.value)
    }
 
    useEffect(() => {
        props.filterChangedCallback()
    }, [year]);
 
    return (
        <div style={{display: "inline-block", width: "400px"}} onChange={onYearChange}>
            <div style={{padding: "10px", backgroundColor: "#d3d3d3", textAlign: "center"}}>This is a very wide filter</div>
            <label style={{margin: "10px", padding: "50px", display: "inline-block", backgroundColor: "#999999"}}>
                <input type="radio" name="year" value="All" checked={year === 'All'}/> All
            </label>
            <label style={{margin: "10px", padding: "50px", display: "inline-block", backgroundColor: "#999999"}}>
                <input type="radio" name="year" value="2010"/> Since 2010
            </label>
        </div>
    )
 });

function GridExample() {

    // never changes, so we can use useMemo
    const modules = useMemo( ()=> [ClientSideRowModelModule], []);

    // never changes, so we can use useMemo
    const columnDefs = useMemo( ()=> [
        { field: 'athlete' },
        { field: 'age', filter: 'agNumberColumnFilter' },
        { field: 'country' },
        { field: 'year', filterFramework: YearFilter },
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

    return (
        <AgGridReact 

            // turn on AG Grid React UI
            reactUi="true"

            // all other properties as normal...
            className="ag-theme-alpine"
            animateRows="true"
            modules={modules}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            rowData={rowData}
        />
    );
}

render(<GridExample></GridExample>, document.querySelector('#root'));
