import React from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

export default (props: CustomCellRendererProps) => {
    const footer = props.node.footer;
    const isRootLevel = props.node.level === -1;
    const value = props.value;

    if (footer) {
        if (isRootLevel) {
            return <span style={{ textDecoration: 'underline', fontWeight: 'bold' }}>Grand Total</span>;
        } else {
            return <span style={{ textDecoration: 'underline' }}>Sub Total {value}</span>;
        }
    } else {
        return <span>{value}</span>;
    }
};
