import React, { useCallback } from 'react';
import { IDoesFilterPassParams } from '@ag-grid-community/core';
import { CustomFilterProps, useGridFilter } from '@ag-grid-community/react';

export default ({ model, onModelChange, getValue }: CustomFilterProps) => {
    const doesFilterPass = useCallback((params: IDoesFilterPassParams) => {
        const { node } = params;

        const value = getValue(node);

        if (value == null) return false;
        return Number(value) > Number(model);
    }, [model]);

    useGridFilter({
        doesFilterPass,
    });

    return (
        <div style={{ padding: "4px" }}>
            <div style={{ fontWeight: "bold" }}>Greater than:</div>
            <div>
                <input
                    value={model == null ? '' : model}
                    style={{ margin: "4px 0 4px 0" }}
                    type="number"
                    min="0"
                    onChange={({ target: { value }}) => onModelChange(value === '' ? null : Number(value))}
                    placeholder="Number of medals..."
                />
            </div>
        </div>
    );
};
