import React from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

export const CountryFlagCellRenderer = (props: CustomCellRendererProps) => {
    if (!props.value) {
        return null;
    }

    const countryCode = props.value.toLowerCase();
    const flagUrl = `https://flags.fmcdn.net/data/flags/mini/${countryCode}.png`;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <img src={flagUrl} width={15} height={10} style={{ border: 0 }} alt={props.value} />
            <span>{props.value}</span>
        </div>
    );
};
