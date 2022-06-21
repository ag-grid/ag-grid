'use strict';
import React, {Component} from 'react';
import {render} from 'react-dom';
import {AgGridReact} from '@ag-grid-community/react';
import {ClientSideRowModelModule} from '@ag-grid-community/client-side-row-model';
import {SetFilterModule} from '@ag-grid-enterprise/set-filter';
import {MenuModule} from '@ag-grid-enterprise/menu';
import {FiltersToolPanelModule} from '@ag-grid-enterprise/filter-tool-panel';
import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-alpine.css";

import {ModuleRegistry} from '@ag-grid-community/core';

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule, SetFilterModule, MenuModule, FiltersToolPanelModule])

const colourCellRenderer = props => {
    if (!props.value || props.value === '(Select All)') {
        return props.value;
    }

    const styles = {
        verticalAlign: "middle",
        border: "1px solid black",
        margin: 3,
        display: "inline-block",
        width: 10,
        height: 10,
        backgroundColor: props.value.toLowerCase()
    };
    return <React.Fragment>
        <div style={styles}/>
        {props.value}</React.Fragment>;
}

const FILTER_TYPES = {
    insensitive: 'colour',
    sensitive: 'colour_1',
};

const MANGLED_COLOURS = ['ReD', 'OrAnGe', 'WhItE', 'YeLlOw'];

class GridExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnDefs: [
                {
                    headerName: 'Case Insensitive (default)',
                    field: 'colour',
                    filter: 'agSetColumnFilter',
                    filterParams: {
                        caseSensitive: false,
                        cellRenderer: colourCellRenderer,
                    },
                },
                {
                    headerName: 'Case Sensitive',
                    field: 'colour',
                    filter: 'agSetColumnFilter',
                    filterParams: {
                        caseSensitive: true,
                        cellRenderer: colourCellRenderer,
                    },
                },
            ],
            defaultColDef: {
                flex: 1,
                minWidth: 225,
                cellRenderer: colourCellRenderer,
                resizable: true,
                floatingFilter: true,
            },
            sideBar: 'filters',
            rowData: getData()
        };


    }

    onGridReady = params => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;

    }

    onFirstDataRendered = (params) => {
        ((this.gridApi.getToolPanelInstance('filters'))).expandFilters();
    }

    setModel = (type) => {
        const instance = this.gridApi.getFilterInstance(FILTER_TYPES[type]);
        instance.setModel({values: MANGLED_COLOURS});
        this.gridApi.onFilterChanged();
    }

    getModel = (type) => {
        const instance = this.gridApi.getFilterInstance(FILTER_TYPES[type]);
        alert(JSON.stringify(instance.getModel(), null, 2));
    }

    setFilterValues = (type) => {
        const instance = this.gridApi.getFilterInstance(FILTER_TYPES[type]);
        instance.setFilterValues(MANGLED_COLOURS);
        instance.applyModel();
        this.gridApi.onFilterChanged();
    }

    getValues = (type) => {
        const instance = this.gridApi.getFilterInstance(FILTER_TYPES[type]);
        alert(JSON.stringify(instance.getValues(), null, 2));
    }

    reset = (type) => {
        const instance = this.gridApi.getFilterInstance(FILTER_TYPES[type]);
        instance.resetFilterValues();
        instance.setModel(null);
        this.gridApi.onFilterChanged();
    }

    render() {
        return (
            <div style={{width: '100%', height: '100%'}}>
                <div className="example-wrapper">
                    <div className="example-header">
                        <div>
                            Case Insensitive:
                            <button onClick={() => this.setModel('insensitive')}>API: setModel() - mismatching case</button>
                            <button onClick={() => this.getModel('insensitive')}>API: getModel()</button>
                            <button onClick={() => this.setFilterValues('insensitive')}>API: setFilterValues() - mismatching case</button>
                            <button onClick={() => this.getValues('insensitive')}>API: getValues()</button>
                            <button onClick={() => this.reset('insensitive')}>Reset</button>
                        </div>
                        <div style={{"paddingTop": "10px"}}>
                            Case Sensitive:
                            <button onClick={() => this.setModel('sensitive')}>API: setModel() - mismatching case</button>
                            <button onClick={() => this.getModel('sensitive')}>API: getModel()</button>
                            <button onClick={() => this.setFilterValues('sensitive')}>API: setFilterValues() - mismatching case</button>
                            <button onClick={() => this.getValues('sensitive')}>API: getValues()</button>
                            <button onClick={() => this.reset('sensitive')}>Reset</button>
                        </div>
                    </div>
                    <div

                        style={{
                            height: '100%',
                            width: '100%'
                        }}
                        className="ag-theme-alpine">
                        <AgGridReact
                            columnDefs={this.state.columnDefs}
                            defaultColDef={this.state.defaultColDef}
                            sideBar={this.state.sideBar}
                            rowData={this.state.rowData}
                            onGridReady={this.onGridReady}
                            onFirstDataRendered={this.onFirstDataRendered.bind(this)}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

render(
    <GridExample></GridExample>,
    document.querySelector('#root')
)
