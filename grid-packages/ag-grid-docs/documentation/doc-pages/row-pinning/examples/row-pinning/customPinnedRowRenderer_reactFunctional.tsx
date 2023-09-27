import React from 'react';
import { ICellRendererParams } from '@ag-grid-community/core';

interface CellStyle { [cssProperty: string]: string | number; }
export default function CustomPinnedRowRenderer(props: ICellRendererParams & { style: CellStyle }) {
    return (
        <span style={props.style}>{props.value}</span>
    );
};

