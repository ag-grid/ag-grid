import React from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

export default (props: CustomCellRendererProps) => (
    <span style={{ backgroundColor: props.node.group ? '#CC222244' : '#33CC3344', padding: 2 }}>{props.value}</span>
);
