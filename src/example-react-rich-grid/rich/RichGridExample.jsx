import React, {Component} from "react";
import {AgGridReact} from "ag-grid-react";
import RowDataFactory from "./RowDataFactory.jsx";
import ColDefFactory from "./ColDefFactory.jsx";
import DateComponent from "./DateComponent.jsx";
import SortableHeaderComponent from "./SortableHeaderComponent.jsx";

// take this line out if you do not want to use ag-Grid-Enterprise
import "ag-grid-enterprise";

export default class RichGridExample extends Component {

    constructor() {
        super();

        this.state = {
            quickFilterText: null,
            showToolPanel: false,
            columnDefs: new ColDefFactory().createColDefs(),
            rowData: new RowDataFactory().createRowData(),
            icons: {
                columnRemoveFromGroup: '<i class="fa fa-remove"/>',
                filter: '<i class="fa fa-filter"/>',
                sortAscending: '<i class="fa fa-long-arrow-down"/>',
                sortDescending: '<i class="fa fa-long-arrow-up"/>',
                groupExpanded: '<i class="fa fa-minus-square-o"/>',
                groupContracted: '<i class="fa fa-plus-square-o"/>',
                columnGroupOpened: '<i class="fa fa-minus-square-o"/>',
                columnGroupClosed: '<i class="fa fa-plus-square-o"/>'
            }
        };

        // the grid options are optional, because you can provide every property
        // to the grid via standard React properties. however, the react interface
        // doesn't block you from using the standard JavaScript interface if you
        // wish. Maybe you have the gridOptions stored as JSON on your server? If
        // you do, the providing the gridOptions as a standalone object is just
        // what you want!
        this.gridOptions = {
            //We register the react date component that ag-grid will use to render
            dateComponentFramework: DateComponent,
            // this is how you listen for events using gridOptions
            onModelUpdated: function () {
                console.log('event onModelUpdated received');
            },
            defaultColDef: {
                headerComponentFramework: SortableHeaderComponent,
                headerComponentParams: {
                    menuIcon: 'fa-bars'
                }
            },
            // this is a simple property
            rowBuffer: 10, // no need to set this, the default is fine for almost all scenarios,
            floatingFilter: true
        };

        this.onGridReady = this.onGridReady.bind(this);
        this.onRowSelected = this.onRowSelected.bind(this);
        this.onCellClicked = this.onCellClicked.bind(this);
    }

    onToggleToolPanel(event) {
        this.setState({showToolPanel: event.target.checked});
    }

    onGridReady(params) {
        this.api = params.api;
        this.columnApi = params.columnApi;
    }

    deselectAll() {
        this.api.deselectAll();
    }

    setCountryVisible(visible) {
        this.columnApi.setColumnVisible('country', visible);
    }

    onQuickFilterText(event) {
        this.setState({quickFilterText: event.target.value});
    }

    onCellClicked(event) {
        console.log('onCellClicked: ' + event.data.name + ', col ' + event.colIndex);
    }

    onRowSelected(event) {
        console.log('onRowSelected: ' + event.node.data.name);
    }

    onRefreshData() {
        let newRowData = new RowDataFactory().createRowData();
        this.setState({
            rowData: newRowData
        });
    }

    invokeSkillsFilterMethod() {
        let skillsFilter = this.api.getFilterInstance('skills');
        let componentInstance = skillsFilter.getFrameworkComponentInstance();
        componentInstance.helloFromSkillsFilter();
    }

    dobFilter() {
        let dateFilterComponent = this.gridOptions.api.getFilterInstance('dob');
        dateFilterComponent.setFilterType('equals');
        dateFilterComponent.setDateFrom('2000-01-01');

        // as the date filter is a React component, and its using setState internally, we need
        // to allow time for the state to be set (as setState is an async operation)
        // simply wait for the next tick
        setTimeout(() => {
            this.gridOptions.api.onFilterChanged();
        }, 0)
    }

    render() {
        return (
            <div style={{width: '900px'}}>
                <div style={{display: "inline-block", width: "100%"}}>
                    <div style={{float: "left"}}>
                        <b>Employees Skills and Contact Details</b><span id="rowCount"/>
                    </div>
                </div>
                <div style={{marginTop: 10}}>
                    <div>
                        <span>
                            Grid API:
                            <button onClick={() => {
                                this.refs.myGrid.api.selectAll()
                            }} className="btn btn-primary">Select All</button>
                            <button onClick={this.deselectAll.bind(this)}
                                    className="btn btn-primary">Clear Selection</button>
                        </span>
                        <span style={{float: "right"}}>
                            Column API:
                            <button onClick={this.setCountryVisible.bind(this, false)} className="btn btn-primary">Hide Country Column</button>
                            <button onClick={this.setCountryVisible.bind(this, true)} className="btn btn-primary">Show Country Column</button>
                        </span>
                    </div>
                    <div style={{display: "inline-block", width: "100%", marginTop: 10, marginBottom: 10}}>
                        <div style={{float: "left"}}>
                            <label>
                                <input type="checkbox" onChange={this.onToggleToolPanel.bind(this)}
                                       style={{marginRight: 5}}/>
                                Show Tool Panel
                            </label>
                        </div>
                        <div style={{float: "left", marginLeft: 20}}>
                            <button onClick={this.onRefreshData.bind(this)} className="btn btn-primary">Refresh Data
                            </button>
                        </div>
                        <div style={{float: "left", marginLeft: 20}}>
                            <input type="text" onChange={this.onQuickFilterText.bind(this)}
                                   placeholder="Type text to filter..."/>
                        </div>
                        <div style={{float: "right"}}>
                            Filter API:
                            <button onClick={this.invokeSkillsFilterMethod.bind(this, false)}
                                    className="btn btn-primary">Invoke Skills Filter Method
                            </button>
                            <button onClick={this.dobFilter.bind(this)} className="btn btn-primary">DOB equals to
                                01/01/2000
                            </button>
                        </div>
                    </div>
                    <div style={{height: 400, width: 900}} className="ag-theme-fresh">
                        <AgGridReact
                            ref="myGrid"
                            // gridOptions is optional - it's possible to provide
                            // all values as React props
                            gridOptions={this.gridOptions}

                            // listening for events
                            onGridReady={this.onGridReady}
                            onRowSelected={this.onRowSelected}
                            onCellClicked={this.onCellClicked}

                            // binding to simple properties
                            showToolPanel={this.state.showToolPanel}
                            quickFilterText={this.state.quickFilterText}

                            // binding to an object property
                            icons={this.state.icons}

                            // binding to array properties
                            columnDefs={this.state.columnDefs}
                            rowData={this.state.rowData}

                            // no binding, just providing hard coded strings for the properties
                            suppressRowClickSelection="true"
                            rowSelection="multiple"
                            enableColResize="true"
                            enableSorting="true"
                            enableFilter="true"
                            groupHeaders="true"
                            rowHeight="22"
                        />
                    </div>
                </div>
            </div>
        );
    }
}
