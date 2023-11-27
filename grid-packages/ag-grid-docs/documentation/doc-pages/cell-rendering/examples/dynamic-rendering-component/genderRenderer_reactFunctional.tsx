import React from 'react';
import { ICellRendererParams } from "@ag-grid-community/core";

export default (props: ICellRendererParams) => {
    const icon = props.value === 'Male' ? 'fa-male' : 'fa-female';
    return (
        <span>
            <i className={`fa ${icon}`}></i> {props.value}
        </span>
    );
};

