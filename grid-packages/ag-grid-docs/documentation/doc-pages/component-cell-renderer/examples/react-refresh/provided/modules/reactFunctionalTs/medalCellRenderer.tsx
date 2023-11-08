import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { ICellRendererParams } from '@ag-grid-community/core';

export default forwardRef((props: ICellRendererParams<IOlympicData, number>, ref) => {
    const [value, setValue] = useState(props.value);

    useEffect(() => {
        console.log('renderer created');
    }, []);

    useImperativeHandle(ref, () => {
        return {
            refresh(params: ICellRendererParams<IOlympicData, number>) {
                console.log('renderer refreshed');
                setValue(params.value);
                return true;
            }
        };
    });

    return <span>{new Array(value).fill('#' as any).join('')}</span>;
});
