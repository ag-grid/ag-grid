import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

export default forwardRef((props: CustomCellRendererProps<IOlympicData, number>, ref) => {
    const [value, setValue] = useState(props.value);

    useEffect(() => {
        console.log('renderer created');
    }, []);

    useImperativeHandle(ref, () => {
        return {
            refresh(params: CustomCellRendererProps<IOlympicData, number>) {
                console.log('renderer refreshed');
                setValue(params.value);
                return true;
            },
        };
    });

    return <span>{new Array(value).fill('#' as any).join('')}</span>;
});
