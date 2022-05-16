import React from 'react';
import { ICellRendererParams } from '@ag-grid-community/core';

export default ({data, context}: ICellRendererParams) => (
    <React.Fragment>
        <img alt={data.country} src={context.base64flags[context.countryCodes[data.country]]} /> {data.country}
    </React.Fragment>
)
