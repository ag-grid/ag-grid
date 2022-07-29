import React, { forwardRef, useImperativeHandle } from 'react';
import { ICellRendererParams } from "@ag-grid-community/core";

export default (props: ICellRendererParams) => {
    const cellValue = props.valueFormatted ? props.valueFormatted : props.value;

    return (
        <span>
            <span>{cellValue}</span>&nbsp;
            <button onClick={() => alert(`${cellValue} medals won!`)}>Push For Total</button>
        </span>
    );
}
