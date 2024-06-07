import type { CustomCellRendererProps } from '@ag-grid-community/react';
import React from 'react';

export default (props: CustomCellRendererProps) =>
    props.value && (
        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {(Array.isArray(props.value) ? props.value : [props.value])
                .filter((value) => value != null && value !== '')
                .map((value: string, idx: number, values: string[]) => (
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
