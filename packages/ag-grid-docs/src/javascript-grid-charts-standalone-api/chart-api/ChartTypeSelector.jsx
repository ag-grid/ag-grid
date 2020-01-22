import React from 'react';
import './ChartTypeSelector.css';

export const ChartTypeSelector = ({ type, onChange }) => {
    const options = {
        bar: 'Bar',
        line: 'Line',
        area: 'Area',
    };

    return <select className="chart-type-selector" value={type} onChange={e => onChange(e.target.value)}>
        {Object.keys(options).map(key => <option value={key}>{options[key]}</option>)}
    </select>;
};