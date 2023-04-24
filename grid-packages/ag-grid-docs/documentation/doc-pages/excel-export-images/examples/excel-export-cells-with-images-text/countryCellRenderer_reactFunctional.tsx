import React from 'react';
import { ICellRendererParams } from '@ag-grid-community/core';
import { FlagContext, IOlympicData } from './interfaces';

export default ({data, context}: ICellRendererParams<IOlympicData, any, FlagContext>) => (
    <React.Fragment>
        <img alt={data!.country} src={context.base64flags[context.countryCodes[data!.country]]} /> {data!.country}
    </React.Fragment>
)
