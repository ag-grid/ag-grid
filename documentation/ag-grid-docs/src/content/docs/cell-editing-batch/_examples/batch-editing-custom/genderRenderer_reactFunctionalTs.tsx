import React from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

export default (props: CustomCellRendererProps) => {
    const icon = props.value === 'Male' ? 'fa-male' : 'fa-female';
    return props.value ? (
        <span>
            <i className={`fa ${icon}`}></i> {props.value}
        </span>
    ) : (
        <React.Fragment></React.Fragment>
    );
};
