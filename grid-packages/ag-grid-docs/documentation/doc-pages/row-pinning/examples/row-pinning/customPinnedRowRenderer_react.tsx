import React, { Component } from 'react';
import { ICellRendererParams } from '@ag-grid-community/core';

interface CellStyle { [cssProperty: string]: string | number; }
export default class CustomPinnedRowRenderer extends Component<ICellRendererParams & { style: CellStyle }> {
    render() {
        return (
            <span style={this.props.style}>{this.props.value}</span>
        );
    }
};
