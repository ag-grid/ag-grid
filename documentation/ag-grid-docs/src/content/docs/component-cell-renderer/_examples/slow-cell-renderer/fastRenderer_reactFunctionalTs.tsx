import React from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

export default (params: CustomCellRendererProps) => {
    return <div>{params.value}</div>;
};
