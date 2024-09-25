import React from 'react';

import { CustomCellRendererProps } from 'ag-grid-react';

import { FlagContext, IOlympicData } from './interfaces';

export default (props: CustomCellRendererProps<IOlympicData, any, FlagContext>) => (
    <React.Fragment>
        <img
            alt={props.data!.country}
            src={props.context.base64flags[props.context.countryCodes[props.data!.country]]}
        />
    </React.Fragment>
);
