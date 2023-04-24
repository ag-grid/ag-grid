import React, { useEffect, useState } from 'react';
import { ICellRendererParams } from '@ag-grid-community/core';

export default (props: ICellRendererParams & { isFilterRenderer?: boolean }) => {
    const [value, setValue] = useState<string>('');

    useEffect(() => {
        if (!props.value) {
            setValue(props.isFilterRenderer ? '(Blanks)' : props.value);
        } else if (props.value === '(Select All)') {
            setValue(props.value);
        } else {
            const url = `https://flags.fmcdn.net/data/flags/mini/${props.context.COUNTRY_CODES[props.value]}.png`;
            const flagImage = `<img class="flag" border="0" width="15" height="10" src="${url}">`;

            setValue(`${flagImage} ${props.value}`);
        }
    }, [])

    return <div dangerouslySetInnerHTML={{ __html: value }}></div>;
}
