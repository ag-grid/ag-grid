import React, { forwardRef, useImperativeHandle } from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

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
