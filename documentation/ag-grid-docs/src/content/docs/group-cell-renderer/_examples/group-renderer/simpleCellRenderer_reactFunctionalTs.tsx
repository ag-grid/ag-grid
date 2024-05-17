import { CustomCellRendererProps } from '@ag-grid-community/react';
import React from 'react';

export default (props: CustomCellRendererProps) => (
    <span style={{ backgroundColor: props.node.group ? '#CC222244' : '#33CC3344', padding: 2 }}>{props.value}</span>
);
