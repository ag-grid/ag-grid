import React from 'react';
import { ICellRendererParams } from '@ag-grid-community/core';
import { FlagContext, IOlympicData } from './interfaces';

export default (props: ICellRendererParams<IOlympicData, any, FlagContext>) => (
    <React.Fragment>
        <img alt={props.data!.country} src={props.context.base64flags[props.context.countryCodes[props.data!.country]]} />
    </React.Fragment>
)
