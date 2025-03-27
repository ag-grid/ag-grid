import React from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

interface CellStyle {
    [cssProperty: string]: string | number;
}
export default function CustomPinnedRowRenderer(props: CustomCellRendererProps & { style: CellStyle }) {
    return <span style={props.style}>{props.value}</span>;
}
