import { CustomCellRendererProps } from '@ag-grid-community/react';
import React from 'react';

function removeSpaces(str: string) {
    return str ? str.replace(/\s/g, '') : str;
}

export default (props: CustomCellRendererProps) => (
    <React.Fragment>
        {props.value === '(Select All)' ? (
            <div>{props.value}</div>
        ) : (
            <span style={{ color: removeSpaces(props.valueFormatted || '') }}>{props.valueFormatted}</span>
        )}
    </React.Fragment>
);
