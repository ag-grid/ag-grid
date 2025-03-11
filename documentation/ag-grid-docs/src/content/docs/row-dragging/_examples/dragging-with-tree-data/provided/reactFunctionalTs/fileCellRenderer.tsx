import React from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

import { getFileCssIcon } from './fileUtils';

export default ({ value, data }: CustomCellRendererProps) => {
    return (
        <span className="filename">
            <i className={getFileCssIcon(data?.type, value)}></i>
            {value}
        </span>
    );
};
