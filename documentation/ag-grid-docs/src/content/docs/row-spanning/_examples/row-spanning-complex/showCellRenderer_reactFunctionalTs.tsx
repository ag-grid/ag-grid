import React from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

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
