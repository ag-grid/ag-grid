import { CustomCellRendererProps } from '@ag-grid-community/react';
import React from 'react';

export default function DetailCellRenderer(props: CustomCellRendererProps) {
    return (
        <h1 className="custom-detail" style={{ padding: '20px' }}>
            {props.pinned ?? 'center'}
        </h1>
    );
}
