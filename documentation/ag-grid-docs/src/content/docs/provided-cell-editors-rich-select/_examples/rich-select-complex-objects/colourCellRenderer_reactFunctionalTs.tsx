import { CustomCellRendererProps } from '@ag-grid-community/react';
import React from 'react';

export default (params: CustomCellRendererProps) => {
    return <div>{params.value.name}</div>;
};
