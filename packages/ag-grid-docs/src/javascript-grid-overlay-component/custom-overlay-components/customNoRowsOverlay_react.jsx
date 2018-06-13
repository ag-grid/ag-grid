import React, {Component} from 'react';

export default class CustomNoRowsOverlay extends Component {
    render() {
        return (
            <div className="ag-overlay-loading-center" style={{backgroundColor: 'lightcoral', height: '9%'}}>
                <i className="fa fa-frown-o"> {this.props.noRowsMessageFunc()}</i>
            </div>
        );
    }
}