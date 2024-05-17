import { useGridFilter } from '@ag-grid-community/react';
import React, { useCallback } from 'react';

export default ({ model, onModelChange }) => {
    const doesFilterPass = useCallback((params) => {
        return params.data.year >= 2004;
    }, []);

    useGridFilter({
        doesFilterPass,
    });

    return (
        <div className="year-filter">
            <label>
                <input type="radio" name="year" value="All" checked={!model} onChange={() => onModelChange(null)} /> All
            </label>
            <label>
                <input type="radio" name="year" value="2010" checked={!!model} onChange={() => onModelChange(true)} />{' '}
                After 2004
            </label>
        </div>
    );
};
