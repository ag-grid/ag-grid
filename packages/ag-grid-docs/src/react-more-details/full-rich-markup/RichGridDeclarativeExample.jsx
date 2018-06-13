import React, {Component} from "react";
import {AgGridColumn, AgGridReact} from "ag-grid-react";
import RowDataFactory from "./RowDataFactory.jsx";
import DateComponent from "./DateComponent.jsx";
import SkillsCellRenderer from './SkillsCellRenderer.jsx';
import NameCellEditor from './NameCellEditor.jsx';
import ProficiencyCellRenderer from './ProficiencyCellRenderer.jsx';
import RefData from './RefData.jsx';
import SkillsFilter from './SkillsFilter.jsx';
import ProficiencyFilter from './ProficiencyFilter.jsx';
import HeaderGroupComponent from './HeaderGroupComponent.jsx';
import SortableHeaderComponent from './SortableHeaderComponent.jsx';

// take this line out if you do not want to use ag-Grid-Enterprise
import "ag-grid-enterprise";

export default class RichGridDeclarativeExample extends Component {

    constructor() {
        super();

        this.state = {
            rowData: new RowDataFactory().createRowData()
        };
    }

    /* Grid Events we're listening to */
    onGridReady = (params) => {
        this.api = params.api;
        this.columnApi = params.columnApi;
    };

    onCellClicked = (event) => {
        console.log('onCellClicked: ' + event.data.name + ', col ' + event.colIndex);
    };

    onRowSelected = (event) => {
        console.log('onRowSelected: ' + event.node.data.name);
    };

    static countryCellRenderer(params) {
        if (params.value) {
            return `<img border='0' width='15' height='10' style='margin-bottom: 2px' src='http://flags.fmcdn.net/data/flags/mini/${RefData.COUNTRY_CODES[params.value]}.png'> ${params.value}`;
        } else {
            return null;
        }
    }

    static dateCellRenderer(params) {
        return RichGridDeclarativeExample.pad(params.value.getDate(), 2) + '/' +
            RichGridDeclarativeExample.pad(params.value.getMonth() + 1, 2) + '/' +
            params.value.getFullYear();
    }

    static pad(num, totalStringSize) {
        let asString = num + "";
        while (asString.length < totalStringSize) asString = "0" + asString;
        return asString;
    }

    render() {
        return (
            <div style={{height: 525, width: 900}} className="ag-theme-balham">
                <AgGridReact
                    // listening for events
                    onGridReady={this.onGridReady}
                    onRowSelected={this.onRowSelected}
                    onCellClicked={this.onCellClicked}

                    // binding to array properties
                    rowData={this.state.rowData}

                    // no binding, just providing hard coded strings for the properties
                    // boolean properties will default to true if provided (ie enableColResize => enableColResize="true")
                    suppressRowClickSelection
                    rowSelection="multiple"
                    enableColResize
                    enableSorting
                    enableFilter
                    floatingFilter
                    groupHeaders

                    // setting grid wide date component
                    dateComponentFramework={DateComponent}

                    // setting default column properties
                    defaultColDef={{
                        headerComponentFramework: SortableHeaderComponent,
                        headerComponentParams: {
                            menuIcon: 'fa-bars'
                        }
                    }}
                >
                    <AgGridColumn headerName="#" width={30} checkboxSelection suppressSorting suppressMenu suppressFilter pinned></AgGridColumn>
                    <AgGridColumn headerName="Employee" headerGroupComponentFramework={HeaderGroupComponent}>
                        <AgGridColumn field="name" width={150} enableRowGroup enablePivot pinned editable cellEditorFramework={NameCellEditor}></AgGridColumn>
                        <AgGridColumn field="country" width={150} enableRowGroup enablePivot pinned editable cellRenderer={RichGridDeclarativeExample.countryCellRenderer} filterParams={{cellRenderer: RichGridDeclarativeExample.countryCellRenderer, cellHeight:20}}></AgGridColumn>
                        <AgGridColumn field="dob" width={145} headerName="DOB" filter="date" pinned columnGroupShow="open" cellRenderer={RichGridDeclarativeExample.dateCellRenderer}></AgGridColumn>
                    </AgGridColumn>
                    <AgGridColumn headerName="IT Skills">
                        <AgGridColumn field="skills" width={120} enableRowGroup enablePivot suppressSorting cellRendererFramework={SkillsCellRenderer} filterFramework={SkillsFilter}></AgGridColumn>
                        <AgGridColumn field="proficiency" width={135} enableValue cellRendererFramework={ProficiencyCellRenderer} filterFramework={ProficiencyFilter}></AgGridColumn>
                    </AgGridColumn>
                    <AgGridColumn headerName="Contact">
                        <AgGridColumn field="mobile" width={150} filter="text"></AgGridColumn>
                        <AgGridColumn field="landline" width={150} filter="text"></AgGridColumn>
                        <AgGridColumn field="address" width={500} filter="text"></AgGridColumn>
                    </AgGridColumn>
                </AgGridReact>
            </div>
    );
    }
}
