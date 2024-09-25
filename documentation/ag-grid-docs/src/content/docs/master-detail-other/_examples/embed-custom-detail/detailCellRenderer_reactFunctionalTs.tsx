import React from 'react';

import { CustomCellRendererProps } from 'ag-grid-react';

export default function DetailCellRenderer(props: CustomCellRendererProps) {
    return (
        <h1 className="custom-detail" style={{ padding: '20px' }}>
            {props.pinned ?? 'center'}
        </h1>
    );
}
