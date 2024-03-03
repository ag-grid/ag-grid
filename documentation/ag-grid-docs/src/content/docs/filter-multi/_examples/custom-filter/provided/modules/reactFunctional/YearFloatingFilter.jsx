import React from 'react';

export default ({ model, onModelChange }) => {
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
