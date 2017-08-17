import React, {Component} from "react";

import {AgGridReact} from "ag-grid-react";

import "./DetailPanelComponent.css";

export default class DetailPanelComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnDefs: this.createColumnDefs(),
            parentRecord: this.props.node.parent.data,
            img: `images/${this.props.node.parent.data.image}.png`
        };

        this.onGridReady = this.onGridReady.bind(this);
        this.onSearchTextChange = this.onSearchTextChange.bind(this);

        // override the containing div so that the child grid fills the row height
        this.props.reactContainer.style.height = "100%";
    }

    onGridReady(params) {
        this.gridApi = params.api;
        this.columnApi = params.columnApi;

        this.gridApi.setRowData(this.state.parentRecord.callRecords);
        setTimeout(() => {
            this.gridApi.sizeColumnsToFit();
        })
    }

    onSearchTextChange(newData) {
        this.gridApi.setQuickFilter(newData);
    }

    createColumnDefs() {
        return [
            {headerName: 'Call ID', field: 'callId', cellClass: 'call-record-cell'},
            {headerName: 'Direction', field: 'direction', cellClass: 'call-record-cell'},
            {headerName: 'Number', field: 'number', cellClass: 'call-record-cell'},
            {
                headerName: 'Duration',
                field: 'duration',
                cellClass: 'call-record-cell',
                valueFormatter: this.secondCellFormatter
            },
            {headerName: 'Switch', field: 'switchCode', cellClass: 'call-record-cell'}];

    }

    secondCellFormatter(params) {
        return params.value.toLocaleString() + 's';
    }

    onButtonClick() {
        window.alert('Sample button pressed!!');
    }

    render() {
        return (
            <div className="full-width-panel">
                <div className="full-width-details">
                    <div className="full-width-detail"><img width="120px" src={this.state.img}/>
                    </div>
                    <div className="full-width-detail"><b>Name: </b> {this.state.parentRecord.name}</div>
                    <div className="full-width-detail"><b>Account: </b> {this.state.parentRecord.account}</div>
                </div>
                <AgGridReact
                    // properties
                    columnDefs={this.state.columnDefs}

                    enableSorting
                    enableFilter
                    enableColResize

                    // events
                    onGridReady={this.onGridReady}>
                </AgGridReact>
            </div>
        );
    }
}
