import React from 'react';

export default (params) => (
    <span className="missionSpan">
        {
            <img
                alt={`${params.value}`}
                src={`https://www.ag-grid.com/example-assets/icons/${
                    params.value ? 'tick-in-circle' : 'cross-in-circle'
                }.png`}
                className="missionIcon"
            />
        }
    </span>
);
