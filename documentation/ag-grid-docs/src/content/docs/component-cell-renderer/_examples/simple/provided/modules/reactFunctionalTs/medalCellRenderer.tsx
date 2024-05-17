import { CustomCellRendererProps } from '@ag-grid-community/react';
import React from 'react';

export default (props: CustomCellRendererProps<IOlympicData, number>) => (
    <span>{new Array(props.value!).fill('#').join('')}</span>
);
