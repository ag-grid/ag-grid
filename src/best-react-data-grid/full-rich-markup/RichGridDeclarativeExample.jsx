import React, {Component} from "react";
import {AgGridColumn, AgGridReact} from "ag-grid-react";
import RowDataFactory from "./RowDataFactory.jsx";
import ProficiencyCellRenderer from './ProficiencyCellRenderer.jsx';
import RefData from './RefData.jsx';

// take this line out if you do not want to use ag-Grid-Enterprise
import "ag-grid-enterprise";

const COUNTRY_LIST = ["Argentina", "Brazil", "Colombia", "France", "Germany", "Greece", "Iceland", "Ireland",
    "Italy", "Malta", "Portugal", "Norway", "Peru", "Spain", "Sweden", "United Kingdom",
    "Uruguay", "Venezuela", "Belgium", "Luxembourg"];

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
            RichGridDeclarativeExample.pad(params.value.getMonth() + 1, 2) + '/' + params.value.getFullYear();
    }

    static pad(num, totalStringSize) {
        let asString = num + "";
        while (asString.length < totalStringSize) asString = "0" + asString;
        return asString;
    }

    render() {
        return (
            <div style={{height: 525, width: '100%'}} className="ag-theme-balham">
                <AgGridReact
                    // binding to array properties
                    rowData={this.state.rowData}
                    // no binding, just providing hard coded strings for the properties
                    // boolean properties will default to true if provided (ie enableColResize => enableColResize="true")
                    suppressRowClickSelection
                    rowSelection="multiple"
                    enableColResize
                    enableSorting
                    enableFilter
                    groupHeaders
                    >
                    {/* first column has the checkboxes */}
                    <AgGridColumn headerName="#" width={30} checkboxSelection suppressSorting suppressMenu suppressFilter pinned></AgGridColumn>
                    {/* the first three columns are grouped in a group called 'Employee' */}
                    <AgGridColumn headerName="Employee">
                        <AgGridColumn field="name" width={150} pinned editable></AgGridColumn>
                        <AgGridColumn field="country" width={150} pinned editable
                                      cellRenderer={RichGridDeclarativeExample.countryCellRenderer}
                                      cellEditorParams={{ values: COUNTRY_LIST, cellRenderer: RichGridDeclarativeExample.countryCellRenderer}} cellEditor="agRichSelect"
                                      filter="set" filterParams={{cellRenderer: RichGridDeclarativeExample.countryCellRenderer, cellHeight:20}}>
                        </AgGridColumn>
                        <AgGridColumn field="dob" width={110} headerName="Date of Birth" filter="date" pinned valueFormatter={RichGridDeclarativeExample.dateCellRenderer} columnGroupShow="open"></AgGridColumn>
                    </AgGridColumn>
                    {/* the next column is not in a group, just by itself */}
                    <AgGridColumn field="proficiency" width={135} enableValue cellRendererFramework={ProficiencyCellRenderer}></AgGridColumn>
                    {/* then the last group with three columns */}
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
