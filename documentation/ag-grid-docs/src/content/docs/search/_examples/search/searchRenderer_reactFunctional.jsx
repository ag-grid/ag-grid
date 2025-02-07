import React, { useMemo } from 'react';

function getParts({ api, value, valueFormatted, column, node }) {
    const cellValue = valueFormatted ?? value?.toString();
    if (cellValue == null || cellValue === '') {
        return [];
    }
    const cellDisplayValue = `Year is ${cellValue}`;
    const parts =
        column != null
            ? api.searchGetParts({
                  value: cellDisplayValue,
                  node,
                  column,
              })
            : [];
    return parts.length ? parts : [{ value: cellDisplayValue }];
}

export default (params) => {
    return (
        <span>
            {getParts(params).map(({ value: partValue, match, activeMatch }, index) =>
                match ? (
                    <mark key={index} className={`ag-search-match ${activeMatch ? ' ag-search-active-match' : ''}`}>
                        {partValue}
                    </mark>
                ) : (
                    partValue
                )
            )}
        </span>
    );
};
