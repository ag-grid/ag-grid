import React from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

function getParts({ api, value, valueFormatted, column, node }: CustomCellRendererProps) {
    const cellValue = valueFormatted ?? value?.toString();
    if (cellValue == null || cellValue === '') {
        return [];
    }
    const cellDisplayValue = `Year is ${cellValue}`;
    const parts =
        column != null
            ? api.findGetParts({
                  value: cellDisplayValue,
                  node,
                  column,
              })
            : [];
    return parts.length ? parts : [{ value: cellDisplayValue }];
}

export default (params: CustomCellRendererProps) => {
    return (
        <span>
            {getParts(params).map(({ value: partValue, match, activeMatch }, index) =>
                match ? (
                    <mark key={index} className={`ag-find-match${activeMatch ? ' ag-find-active-match' : ''}`}>
                        {partValue}
                    </mark>
                ) : (
                    partValue
                )
            )}
        </span>
    );
};
