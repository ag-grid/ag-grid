import React from 'react';
import { ICellRendererParams } from '@ag-grid-community/core';

function removeSpaces(str: string) {
    return str ? str.replace(/\s/g, '') : str
}

export default (props: ICellRendererParams) => (
    <React.Fragment>
        {(props.value) === '(Select All)'
            ? <div>{props.value}</div>
            : <span style={{ color: removeSpaces(props.valueFormatted) }}>{props.valueFormatted}</span>
        }
    </React.Fragment>
)
