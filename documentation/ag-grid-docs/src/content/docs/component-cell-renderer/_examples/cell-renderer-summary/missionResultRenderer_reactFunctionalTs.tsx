import React from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

export default (params: CustomCellRendererProps) => (
    <span className="missionSpan">
        {
            <img
                alt={`${params.value}`}
                src={`https://www.ag-grid.com/example-assets/icons/${
                    params.value ? 'tick-in-circle' : 'cross-in-circle'
                }.png`}
                className="missionIcon"
            />
        }
    </span>
);
