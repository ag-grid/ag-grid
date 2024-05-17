import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

export default forwardRef((props, ref) => {
    const [value, setValue] = useState(props.value);

    useEffect(() => {
        console.log('renderer created');
    }, []);

    useImperativeHandle(ref, () => {
        return {
            refresh(params) {
                console.log('renderer refreshed');
                setValue(params.value);
                return true;
            },
        };
    });

    return <span>{new Array(value).fill('#').join('')}</span>;
});
