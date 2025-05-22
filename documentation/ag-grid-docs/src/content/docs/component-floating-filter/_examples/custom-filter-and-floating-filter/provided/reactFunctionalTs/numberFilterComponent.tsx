import React from 'react';

import type { CustomFilterDisplayProps } from 'ag-grid-react';

export default ({ model, onModelChange }: CustomFilterDisplayProps) => {
    return (
        <div style={{ padding: '4px' }}>
            <div style={{ fontWeight: 'bold' }}>Greater than:</div>
            <div>
                <input
                    value={model == null ? '' : model}
                    style={{ margin: '4px 0 4px 0' }}
                    type="number"
                    min="0"
                    onChange={({ target: { value } }) => onModelChange(value === '' ? null : Number(value))}
                    placeholder="Number of medals..."
                />
            </div>
        </div>
    );
};
