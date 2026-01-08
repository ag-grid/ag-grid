import React from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

export const TransactionResultCellRenderer = (props: CustomCellRendererProps) => {
    const iconName = props.value === 'Completed' ? 'tick-in-circle' : 'cross-in-circle';
    const iconUrl = `https://www.ag-grid.com/example-assets/icons/${iconName}.png`;

    return (
        <span style={{ display: 'flex', justifyContent: 'center', height: '100%', alignItems: 'center' }}>
            <img src={iconUrl} style={{ width: 'auto', height: 'auto' }} alt={props.value} />
        </span>
    );
};
