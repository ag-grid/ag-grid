import { CustomCellRendererProps } from '@ag-grid-community/react';
import React from 'react';

export default (params: CustomCellRendererProps) => {
    if (!params.value) {
        return;
    }
    return (
        <div>
            <div className="show-name">{params.value.name}</div>
            <div className="presenter-name">{params.value.presenter}</div>
        </div>
    );
};
