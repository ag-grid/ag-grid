import React, { Component } from 'react';
import { ICellRendererParams, ColumnPinnedType } from '@ag-grid-community/core';

export default class DetailCellRenderer extends Component<ICellRendererParams, { pinned: ColumnPinnedType }> {

    constructor(props: ICellRendererParams) {
        super(props);

        this.state = {
            pinned: props.pinned
        }
    }

    render() {
        return (
            <h1 className="custom-detail" style={{ padding: '20px' }}>{this.state.pinned ? this.state.pinned : 'center'}</h1>
        );
    }
}
