import classnames from 'classnames';
import React from 'react';

/**
 * This is used for choosing the chart type in the Standalone Charts API Explorer.
 */
export const ChartTypeSelector = ({ type, onChange }) => {
    const options = {
        column: 'Column',
        bar: 'Bar',
        line: 'Line',
        scatter: 'Scatter',
        area: 'Area',
        pie: 'Pie',
        histogram: 'Histogram',
    };

    return (
        <ul className="tabs-nav-list" role="tablist">
            {Object.keys(options).map((key) => {
                const title = options[key];
                const isActive = key === type;
                return (
                    <li key={key} className="tabs-nav-item">
                        <button
                            className={classnames('button-style-none', 'tabs-nav-link', { active: isActive })}
                            onClick={(e) => {
                                onChange(key);
                                e.preventDefault();
                            }}
                            role="tab"
                            disabled={isActive}
                        >
                            {title}
                        </button>
                    </li>
                );
            })}
        </ul>
    );
};
