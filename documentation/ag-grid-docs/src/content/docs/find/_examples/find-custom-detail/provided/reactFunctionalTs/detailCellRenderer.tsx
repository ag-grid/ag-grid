import React from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

function getParts({ api, node }: CustomCellRendererProps) {
    const cellDisplayValue = 'My Custom Detail';
    const parts = api.findGetParts({
        value: cellDisplayValue,
        node,
        column: null,
    });
    return parts.length ? parts : [{ value: cellDisplayValue }];
}

export default (params: CustomCellRendererProps) => {
    return (
        <div role="gridcell">
            <h1 style={{ padding: '20px' }}>
                {getParts(params).map(({ value: partValue, match, activeMatch }, index) =>
                    match ? (
                        <mark key={index} className={`ag-find-match${activeMatch ? ' ag-find-active-match' : ''}`}>
                            {partValue}
                        </mark>
                    ) : (
                        partValue
                    )
                )}
            </h1>
        </div>
    );
};
