import React, {Component} from 'react';

export default class CustomLoadingOverlay extends Component {
    render() {
        return (
            <div className="ag-overlay-loading-center" style={{backgroundColor: 'lightsteelblue', height: '9%'}}>
                <i className="fa fa-hourglass-1"> {this.props.loadingMessage} </i>
            </div>
        );
    }
}