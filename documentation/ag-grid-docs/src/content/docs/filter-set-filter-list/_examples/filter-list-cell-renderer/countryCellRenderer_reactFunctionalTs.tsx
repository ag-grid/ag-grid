import React, { useEffect, useState } from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

export default (props: CustomCellRendererProps & { isFilterRenderer?: boolean }) => {
    const [value, setValue] = useState<string>();
    const [flagUrl, setFlagUrl] = useState<string>();

    useEffect(() => {
        setFlagUrl(undefined);

        if (!props.value) {
            setValue(props.isFilterRenderer ? '(Blanks)' : props.value);
        } else if (props.value === '(Select All)') {
            setValue(props.value);
        } else {
            const url = `https://flags.fmcdn.net/data/flags/mini/${props.context.COUNTRY_CODES[props.value]}.png`;
            setFlagUrl(url);
            setValue(props.value);
        }
    }, []);

    return (
        <div>
            {flagUrl && <img className="flag" border="0" width="15" height="10" src={flagUrl} />}
            {value}
        </div>
    );
};
