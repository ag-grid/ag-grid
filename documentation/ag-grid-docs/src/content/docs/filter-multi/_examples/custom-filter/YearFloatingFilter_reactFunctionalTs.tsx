import React from 'react';

import type { CustomFloatingFilterDisplayProps } from 'ag-grid-react';

export default ({ model, onModelChange }: CustomFloatingFilterDisplayProps) => {
    return (
        <div className="year-filter">
            <label>
                <input type="radio" checked={!model} onChange={() => onModelChange(null)} /> All
            </label>
            <label>
                <input type="radio" checked={!!model} onChange={() => onModelChange(true)} /> After 2010
            </label>
        </div>
    );
};
