import { CustomCellRendererProps } from '@ag-grid-community/react';
import React from 'react';

export default (params: CustomCellRendererProps) => {
    return (
        <a href={params.value} target="_blank">
            {new URL(params.value).hostname}
        </a>
    );
};
