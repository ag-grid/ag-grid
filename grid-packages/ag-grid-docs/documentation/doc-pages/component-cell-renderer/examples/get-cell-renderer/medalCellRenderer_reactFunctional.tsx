import React, { forwardRef, useImperativeHandle } from 'react';
import { ICellRendererParams } from "@ag-grid-community/core";

export default forwardRef((props: ICellRendererParams, ref) => {
    useImperativeHandle(ref, () => {
        return {
            medalUserFunction() {
                console.log(`user function called for medal column: row = ${props.rowIndex}, column = ${props.column?.getId()}`);
            }
        }
    });

    return <span>{new Array(props.value).fill('#').join('')}</span>;
})
