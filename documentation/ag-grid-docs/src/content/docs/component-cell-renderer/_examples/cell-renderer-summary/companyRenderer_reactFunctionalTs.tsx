import React from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

export default (params: CustomCellRendererProps) => {
    return (
        <a href={params.value} target="_blank">
            {new URL(params.value).hostname}
        </a>
    );
};
