import { CustomCellRendererProps } from '@ag-grid-community/react';
import React, { forwardRef, useImperativeHandle } from 'react';

export default forwardRef((props: CustomCellRendererProps, ref) => {
    useImperativeHandle(ref, () => {
        return {
            medalUserFunction() {
                console.log(
                    `user function called for medal column: row = ${props.node.rowIndex}, column = ${props.column?.getId()}`
                );
            },
        };
    });

    return <span>{new Array(props.value).fill('#').join('')}</span>;
});
