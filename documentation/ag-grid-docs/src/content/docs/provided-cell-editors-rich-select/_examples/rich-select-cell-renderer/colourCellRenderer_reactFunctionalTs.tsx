import { CustomCellRendererProps } from '@ag-grid-community/react';
import React from 'react';

export default (props: CustomCellRendererProps) =>
    props.value != null && (
        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <span
                style={{
                    borderLeft: '10px solid ' + props.value,
                    paddingRight: '5px',
                }}
            ></span>
            {props.value}
        </div>
    );
