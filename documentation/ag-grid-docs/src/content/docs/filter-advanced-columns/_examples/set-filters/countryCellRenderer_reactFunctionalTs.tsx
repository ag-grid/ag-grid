import React from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

import { COUNTRY_CODES } from './countryCodes';

export default (props: CustomCellRendererProps) => {
    const code = props.value ? COUNTRY_CODES[props.value] : undefined;
    return (
        <div>
            {code && (
                <img
                    className="flag"
                    border="0"
                    width="15"
                    height="10"
                    src={`https://flags.fmcdn.net/data/flags/mini/${code}.png`}
                />
            )}{' '}
            {props.value}
        </div>
    );
};
