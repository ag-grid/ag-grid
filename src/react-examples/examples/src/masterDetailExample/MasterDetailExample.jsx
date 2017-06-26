import React, {Component} from "react";

import {AgGridReact} from "ag-grid-react";

import DetailPanelComponent from "./DetailPanelComponent";

export default class MasterDetailExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            rowData: this.createRowData(),
            columnDefs: this.createColumnDefs(),
        };

        this.onGridReady = this.onGridReady.bind(this);
    }

    onGridReady(params) {
        this.gridApi = params.api;
        this.columnApi = params.columnApi;

        this.gridApi.sizeColumnsToFit();
    }

    createColumnDefs() {
        return [
            {
                headerName: 'Name', field: 'name',
                // left column is going to act as group column, with the expand / contract controls
                cellRenderer: 'group',
                // we don't want the child count - it would be one each time anyway as each parent
                // not has exactly one child node
                cellRendererParams: {suppressCount: true}
            },
            {headerName: 'Account', field: 'account'},
            {headerName: 'Calls', field: 'totalCalls'},
            {headerName: 'Minutes', field: 'totalMinutes', valueFormatter: this.minuteCellFormatter}
        ];
    }

    createRowData() {
        let rowData = [];

        for (let i = 0; i < 20; i++) {
            let firstName = this.firstnames[Math.floor(Math.random() * this.firstnames.length)];
            let lastName = this.lastnames[Math.floor(Math.random() * this.lastnames.length)];

            let image = this.images[i % this.images.length];

            let totalDuration = 0;

            let callRecords = [];
            // call count is random number between 20 and 120
            let callCount = Math.floor(Math.random() * 100) + 20;
            for (let j = 0; j < callCount; j++) {
                // duration is random number between 20 and 120
                let callDuration = Math.floor(Math.random() * 100) + 20;
                let callRecord = {
                    callId: this.callIdSequence++,
                    duration: callDuration,
                    switchCode: 'SW' + Math.floor(Math.random() * 10),
                    // 50% chance of in vs out
                    direction: (Math.random() > .5) ? 'In' : 'Out',
                    // made up number
                    number: '(0' + Math.floor(Math.random() * 10) + ') ' + Math.floor(Math.random() * 100000000)
                };
                callRecords.push(callRecord);
                totalDuration += callDuration;
            }

            let record = {
                name: firstName + ' ' + lastName,
                account: i + 177000,
                totalCalls: callCount,
                image: image,
                // convert from seconds to minutes
                totalMinutes: totalDuration / 60,
                callRecords: callRecords
            };
            rowData.push(record);
        }

        return rowData;
    }

    minuteCellFormatter(params) {
        return params.value.toLocaleString() + 'm';
    };

    isFullWidthCell(rowNode) {
        return rowNode.level === 1;
    }

    getRowHeight(params) {
        let rowIsDetailRow = params.node.level === 1;
        // return 100 when detail row, otherwise return 25
        return rowIsDetailRow ? 200 : 25;
    }

    getNodeChildDetails(record) {
        if (record.callRecords) {
            return {
                group: true,
                // the key is used by the default group cellRenderer
                key: record.name,
                // provide ag-Grid with the children of this group
                children: [record.callRecords],
                // for demo, expand the third row by default
                expanded: record.account === 177002
            };
        } else {
            return null;
        }
    }

    render() {
        return (
            <div style={{height: 400, width: 945}}
                 className="ag-fresh">
                <h1>Master-Detail Example</h1>
                <AgGridReact
                    // properties
                    columnDefs={this.state.columnDefs}
                    rowData={this.state.rowData}

                    isFullWidthCell={this.isFullWidthCell}
                    getRowHeight={this.getRowHeight}
                    getNodeChildDetails={this.getNodeChildDetails}
                    fullWidthCellRendererFramework={DetailPanelComponent}

                    enableSorting
                    enableColResize

                    // events
                    onGridReady={this.onGridReady}>
                </AgGridReact>
            </div>
        );
    }

    // a list of names we pick from when generating data
    firstnames = ['Sophia', 'Emma', 'Olivia', 'Isabella', 'Mia', 'Ava', 'Lily', 'Zoe', 'Emily', 'Chloe', 'Layla', 'Madison', 'Madelyn', 'Abigail', 'Aubrey', 'Charlotte', 'Amelia', 'Ella', 'Kaylee', 'Avery', 'Aaliyah', 'Hailey', 'Hannah', 'Addison', 'Riley', 'Harper', 'Aria', 'Arianna', 'Mackenzie', 'Lila', 'Evelyn', 'Adalyn', 'Grace', 'Brooklyn', 'Ellie', 'Anna', 'Kaitlyn', 'Isabelle', 'Sophie', 'Scarlett', 'Natalie', 'Leah', 'Sarah', 'Nora', 'Mila', 'Elizabeth', 'Lillian', 'Kylie', 'Audrey', 'Lucy', 'Maya'];
    lastnames = ['Smith', 'Jones', 'Williams', 'Taylor', 'Brown', 'Davies', 'Evans', 'Wilson', 'Thomas', 'Johnson'];

    images = ['niall', 'sean', 'alberto', 'statue', 'horse'];

    // each call gets a unique id, nothing to do with the grid, just help make the sample
    // data more realistic
    callIdSequence = 555;
};
