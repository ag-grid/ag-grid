import React from 'react';

export default (params) => (
    <span className="imgSpanLogo">
        {params.value && (
            <img
                alt={`${params.value} Flag`}
                src={`https://www.ag-grid.com/example-assets/software-company-logos/${params.value.toLowerCase()}.svg`}
                className="logo"
            />
        )}
    </span>
);
