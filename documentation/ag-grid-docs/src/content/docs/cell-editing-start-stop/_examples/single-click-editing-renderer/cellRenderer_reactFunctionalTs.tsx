import React from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

export default function cellRenderer(props: CustomCellRendererProps) {
    const handleClick = () => {
        props.api.startEditingCell({
            rowIndex: props.node.rowIndex!,
            colKey: props.column!.getId(),
        });
    };
    return (
        <span>
            <button style={{ height: '30px' }} onClick={handleClick}>
                ✎
            </button>
            <span style={{ paddingLeft: '4px' }}>{props.value}</span>
        </span>
    );
}
