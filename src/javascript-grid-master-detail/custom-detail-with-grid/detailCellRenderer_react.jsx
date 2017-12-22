import React, {Component} from 'react';

export default class DetailCellRenderer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: props.data.name,
            account: props.data.account,
            colDefs: [
                {field: 'callId'},
                {field: 'direction'},
                {field: 'number'},
                {field: 'duration', valueFormatter: "x.toLocaleString() + 's'"},
                {field: 'switchCode'}
            ],
                rowData: props.data.callRecords
            }
    }

    render() {
        return (
            <div className="full-width-panel">
              <div className="full-width-details">
                <div className="full-width-detail"><b>Name: </b>{this.state.name}</div>
                <div className="full-width-detail"><b>Account: </b>{this.state.account}</div>
              </div>
              <AgGridReact
                id="detailGrid"
                columnDefs={this.state.colDefs}
                rowData={this.state.rowData}
              />
              <div className="full-width-grid-toolbar">
                   <img className="full-width-phone-icon" src="https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/images/phone.png"/>
                   <button><img src="https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/images/fire.png"/></button>
                   <button><img src="https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/images/frost.png"/></button>
                   <button><img src="https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/images/sun.png"/></button>
              </div>
            </div>
        );
    }
}