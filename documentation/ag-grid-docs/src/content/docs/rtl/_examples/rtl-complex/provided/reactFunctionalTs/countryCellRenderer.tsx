import React from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

const spanStyle: React.CSSProperties = {
    cursor: 'default',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
};

// React port of the frozen `country-renderer_typescript.ts`. Reads the shared flag lookup from
// `props.context.COUNTRY_CODES`. Only renders the flag `<img>` when a code resolves for the value;
// blank/`(Select All)` values and unmapped (localised Arabic/Hebrew) country names render as plain
// text, which avoids requesting `undefined.png` and the resulting 404s in RTL mode.
export default (props: CustomCellRendererProps) => {
    const value = props.value;

    if (value == null || value === '' || value === '(Select All)') {
        return <span style={spanStyle}>{value}</span>;
    }

    const code: string | undefined = props.context.COUNTRY_CODES[value];
    if (code) {
        return (
            <span style={spanStyle}>
                <img
                    className="flag"
                    width={15}
                    height={10}
                    src={`https://flags.fmcdn.net/data/flags/mini/${code}.png`}
                />{' '}
                {value}
            </span>
        );
    }

    return <span style={spanStyle}>{value}</span>;
};
