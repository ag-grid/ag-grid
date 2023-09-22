import React, {Component} from 'react';

export default class CustomLoadingOverlay extends Component {
    render() {
        return (
            <div className="ag-overlay-loading-center">
               <object style={{height: 100, width: 100}} type="image/svg+xml" data="https://ag-grid.com/images/ag-grid-loading-spinner.svg" aria-label="loading"></object>
               <div>  {this.props.loadingMessage} </div>
            </div>
        );
    }
}