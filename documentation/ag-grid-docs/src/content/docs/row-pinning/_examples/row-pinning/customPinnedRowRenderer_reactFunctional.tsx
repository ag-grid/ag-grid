import React from 'react';
import { CustomCellRendererProps } from '@ag-grid-community/react';

interface CellStyle { [cssProperty: string]: string | number; }
export default function CustomPinnedRowRenderer(props: CustomCellRendererProps & { style: CellStyle }) {
    return (
        <span style={props.style}>{props.value}</span>
    );
};

