import React from 'react';

import { CustomCellRendererProps } from 'ag-grid-react';

export default (props: CustomCellRendererProps<IOlympicData, number>) => (
    <span>{new Array(props.value!).fill('#').join('')}</span>
);
