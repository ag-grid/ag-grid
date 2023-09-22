'use strict';
import 'ag-grid-community/styles/ag-grid.css';
import "ag-grid-community/styles/ag-theme-alpine.css";
import React, {Component} from 'react';
import {createRoot} from 'react-dom/client';
import {AgGridReact} from 'ag-grid-react';

class GridExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            gridApi: undefined,
            col1SizeInfoOnGridReady: '-',
            col1SizeInfOnFirstDataRendered: '-',
            columnDefs: [
                {
                    field: 'athleteDescription',
                    valueGetter: (params) => {
                        const {data} = params;
                        const {person} = data;
                        return `The ${person.age} years old ${data.name} from ${person.country}`;
                    },
                },
                {field: 'medals.gold', headerName: 'Gold Medals'},
                {field: 'person.age', headerName: 'Age'},
            ],
            showLoadGridDataButton: true,
            defaultColDef: {
                minWidth: 150,
            }
        };
    }

    onGridReady = (params) => {
        const {api, columnApi} = params;
        this.setState({gridApi: api});

        const column = columnApi.getColumn('athleteDescription');
        if (column) {
            columnApi.autoSizeColumns([column.getId()]);
            this.setState({col1SizeInfoOnGridReady: `${column.getActualWidth()}px`});
        }

        console.warn('AG Grid: onGridReady event triggered');
    }

    onFirstDataRendered = (params) => {
        const {columnApi} = params;
        columnApi.setColumnWidth('athleteDescription', 300);

        const column = columnApi.getColumn('athleteDescription');
        if (column) {
            columnApi.autoSizeColumns([column.getId()]);
            this.setState({
                col1SizeInfOnFirstDataRendered: `${column.getActualWidth()}px`
            });
        }

        this.setState({showLoadGridDataButton: false});
        console.warn('AG Grid: onFirstDataRendered event triggered');
    }

    loadGridData = () => {
        if (this.state.gridApi) {
            this.state.gridApi.setRowData(getData());
        }
    }

    render() {
        return (
            <div style={{width: '100%', height: '100%'}}>
                <div className="example-wrapper" style={{"height": "100%", "boxSizing": "border-box"}}>
                    <div style={{"display": "flex", "flexDirection": "column", "marginBottom": "1rem"}}>
                        <div><span style={{"fontWeight": "bold"}}>Athlete Description</span> column width:</div>
                        <div style={{"paddingLeft": "1em"}}>- On gridReady event:&nbsp;
                            <span style={{"fontWeight": "bold"}}>{this.state.col1SizeInfoOnGridReady}</span>
                        </div>
                        <div style={{"paddingLeft": "1em"}}>>- On firstDataRendered event:&nbsp;
                            <span style={{"fontWeight": "bold"}}>{this.state.col1SizeInfOnFirstDataRendered}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => this.loadGridData()}
                        style={{
                            marginBottom: '1rem',
                            display: this.state.showLoadGridDataButton ? 'inline-block' : 'none'
                        }}
                    >
                        Load Grid Data
                    </button>
                    <div
                        style={{
                            height: '100%',
                            width: '100%'
                        }}
                        className="ag-theme-alpine">
                        <AgGridReact
                            columnDefs={this.state.columnDefs}
                            defaultColDef={this.state.defaultColDef}
                            suppressLoadingOverlay={true}
                            onGridReady={this.onGridReady}
                            onFirstDataRendered={this.onFirstDataRendered.bind(this)}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

const root = createRoot(document.getElementById('root'));
root.render(<GridExample/>);
