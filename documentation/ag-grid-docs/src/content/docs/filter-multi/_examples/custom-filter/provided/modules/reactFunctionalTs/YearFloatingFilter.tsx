import React from 'react';

import type { CustomFloatingFilterProps } from 'ag-grid-react';

export default ({ model, onModelChange }: CustomFloatingFilterProps) => {
    return (
        <div className="year-filter">
            <label>
                <input type="radio" checked={!model} onChange={() => onModelChange(null)} /> All
            </label>
            <label>
                <input type="radio" checked={!!model} onChange={() => onModelChange(true)} /> After 2004
            </label>
        </div>
    );
};
