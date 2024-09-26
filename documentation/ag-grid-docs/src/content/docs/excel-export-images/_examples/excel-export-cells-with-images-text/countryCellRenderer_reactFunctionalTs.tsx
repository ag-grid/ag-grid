import React from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

import type { FlagContext, IOlympicData } from './interfaces';

export default ({ data, context }: CustomCellRendererProps<IOlympicData, any, FlagContext>) => (
    <React.Fragment>
        <img alt={data!.country} src={context.base64flags[context.countryCodes[data!.country]]} /> {data!.country}
    </React.Fragment>
);
