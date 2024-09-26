import React from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

export default (params: CustomCellRendererProps) => (
    <span className="imgSpanLogo">
        {params.value && (
            <img
                alt={`${params.value} Flag`}
                src={`https://www.ag-grid.com/example-assets/software-company-logos/${params.value.toLowerCase()}.svg`}
                className="logo"
            />
        )}
    </span>
);
