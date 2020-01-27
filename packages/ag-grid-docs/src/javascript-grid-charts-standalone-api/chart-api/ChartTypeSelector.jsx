import React from 'react';
import './ChartTypeSelector.css';
import { PresetEditor } from "./Editors.jsx";

export const ChartTypeSelector = ({ type, onChange }) => {
    const options = {
        bar: 'Bar',
        line: 'Line',
        scatter: 'Scatter/Bubble',
        area: 'Area',
        pie: 'Pie/Doughnut',
    };

    return <div className="chart-type-selector"><PresetEditor value={type} options={options} onChange={onChange} /></div>;
};