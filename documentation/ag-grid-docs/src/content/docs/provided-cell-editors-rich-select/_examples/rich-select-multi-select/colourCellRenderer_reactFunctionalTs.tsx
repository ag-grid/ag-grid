import type { CustomCellRendererProps } from '@ag-grid-community/react';
import React from 'react';

export default (props: CustomCellRendererProps) => {
    const { value } = props;

    if (value === null) {
        return;
    }

    const values = Array.isArray(value) ? value : [value];

    return (
        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {values.map((value: string, idx: number) => (
                <React.Fragment key={value}>
                    <span
                        style={{
                            borderLeft: '10px solid ' + value,
                            paddingRight: '2px',
                        }}
                    ></span>
                    {value}
                    {idx !== values.length - 1 && ', '}
                </React.Fragment>
            ))}
        </div>
    );
};
