import { CustomCellRendererProps } from '@ag-grid-community/react';
import React from 'react';

import { FlagContext, IOlympicData } from './interfaces';

export default ({ data, context }: CustomCellRendererProps<IOlympicData, any, FlagContext>) => (
    <React.Fragment>
        <img alt={data!.country} src={context.base64flags[context.countryCodes[data!.country]]} /> {data!.country}
    </React.Fragment>
);
