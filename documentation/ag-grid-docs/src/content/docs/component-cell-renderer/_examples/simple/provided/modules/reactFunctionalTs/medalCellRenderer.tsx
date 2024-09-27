import React from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

export default (props: CustomCellRendererProps<IOlympicData, number>) => (
    <span>{new Array(props.value!).fill('#').join('')}</span>
);
