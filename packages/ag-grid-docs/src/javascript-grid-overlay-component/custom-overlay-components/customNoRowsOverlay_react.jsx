import React, {Component} from 'react';

export default class CustomNoRowsOverlay extends Component {
    render() {
        return (
            <div className="ag-overlay-loading-center" style={{backgroundColor: 'lightcoral', height: '9%'}}>
                <i className="far fa-frown"> {this.props.noRowsMessageFunc()}</i>
            </div>
        );
    }
}