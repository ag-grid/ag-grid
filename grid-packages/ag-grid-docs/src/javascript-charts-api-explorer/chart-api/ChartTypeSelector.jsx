import React from 'react';
import './ChartTypeSelector.css';
import { PresetEditor } from "./Editors.jsx";

export const ChartTypeSelector = ({ type, onChange }) => {
    const options = {
        bar: 'Bar / Column',
        line: 'Line',
        scatter: 'Scatter / Bubble',
        area: 'Area',
        pie: 'Pie / Doughnut',
        histogram: 'Histogram'
    };

    return <div className="chart-type-selector"><PresetEditor value={type} options={options} onChange={onChange} /></div>;
};