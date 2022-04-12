import React from 'react';
import { ICellRendererParams } from '@ag-grid-community/core';

export default (props: ICellRendererParams) => {

    const footer = props.node.footer;
    const isRootLevel = props.node.level === -1;
    const value = props.value;

    if (footer) {
        if (isRootLevel) {
            return <span style={{ color: 'navy', fontWeight: 'bold' }}>Grand Total</span>;
        } else {
            return <span style={{ color: 'navy' }}>Sub Total {value}</span>;
        }
    } else {
        return <span>{value}</span>;
    }
}
