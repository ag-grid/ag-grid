import React from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

export default (params: CustomCellRendererProps) => {
    const delay = 25;
    const start = Date.now();
    while (Date.now() - start < delay) {
        // Busy-waiting loop to simulate a delay
    }

    return <div>{params.value}</div>;
};
