import React from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

const CellRenderer = (params: CustomCellRendererProps) => <span>Lazy Cell: {params.value}</span>;

// NOTE: This is example code to mimic code splitting for a lazy loaded component.
// Do NOT use in production code.
export const LazyCellLoader = () => {
    return new Promise<any>((res) =>
        setTimeout(
            () =>
                res({
                    default: CellRenderer,
                }),
            3000
        )
    );
};
