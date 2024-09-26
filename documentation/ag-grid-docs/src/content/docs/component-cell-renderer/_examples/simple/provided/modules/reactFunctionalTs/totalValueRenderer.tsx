import React from 'react';

import { CustomCellRendererProps } from 'ag-grid-react';

export default (props: CustomCellRendererProps) => {
    const cellValue = props.valueFormatted ? props.valueFormatted : props.value;

    const buttonClicked = () => {
        alert(`${cellValue} medals won!`);
    };

    return (
        <span>
            <span>{cellValue}</span>&nbsp;
            <button onClick={() => buttonClicked()}>Push For Total</button>
        </span>
    );
};
