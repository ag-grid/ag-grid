import React, {Component} from 'react';

export default class CustomLoadingCellRenderer extends Component {
    render() {
        return (
            <div className="ag-custom-loading-cell" style={{paddingLeft: '10px', lineHeight: '25px'}}>
                <i className="fas fa-spinner fa-pulse"></i> <span> {this.props.loadingMessage}</span>
        </div>
        );
    }
}