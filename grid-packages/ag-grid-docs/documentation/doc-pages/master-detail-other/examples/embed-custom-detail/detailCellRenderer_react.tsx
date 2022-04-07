import React, { Component } from 'react';
import { ICellRendererParams } from '@ag-grid-community/core';

export default class DetailCellRenderer extends Component<ICellRendererParams, { pinned: string | null | undefined }> {

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
