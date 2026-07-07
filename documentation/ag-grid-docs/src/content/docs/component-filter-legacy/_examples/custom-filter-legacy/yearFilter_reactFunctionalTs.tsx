import type { ChangeEvent } from 'react';
import React, { useCallback } from 'react';

import type { IDoesFilterPassParams } from 'ag-grid-community';
import type { CustomFilterProps } from 'ag-grid-react';
import { useGridFilter } from 'ag-grid-react';

export default ({ model, onModelChange }: CustomFilterProps) => {
    const doesFilterPass = useCallback((params: IDoesFilterPassParams) => {
        // doesFilterPass only gets called if the filter is active,
        // which is when the model is not null (e.g. >= 2010 in this case)
        return params.data.year >= 2010;
    }, []);

    // register filter handlers with the grid
    useGridFilter({
        doesFilterPass,
    });

    const onYearChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
        onModelChange(value === 'All' ? null : value);
    };

    return (
        <div className="year-filter">
            <div>Select Year Range</div>
            <label>
                <input type="radio" name="year" value="All" checked={model == null} onChange={onYearChange} /> All
            </label>
            <label>
                <input type="radio" name="year" value="2010" checked={model != null} onChange={onYearChange} /> Since
                2010
            </label>
        </div>
    );
};
