import React from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

import type { CountryData, ImageContext } from './interfaces';

export default ({ data, value, context }: CustomCellRendererProps<CountryData, string, ImageContext>) => (
    <React.Fragment>
        <img
            alt={data ? `${data.country} flag` : ''}
            className="country-flag"
            src={data ? `data:image/png;base64,${context.flagImages[data.countryCode]}` : ''}
        />
        {value}
    </React.Fragment>
);
