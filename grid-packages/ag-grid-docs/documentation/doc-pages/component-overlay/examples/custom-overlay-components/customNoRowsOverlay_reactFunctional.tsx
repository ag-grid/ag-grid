import React from 'react';
import { ICellRendererParams } from "@ag-grid-community/core";

export default (props: ICellRendererParams & { noRowsMessageFunc: () => string }) => {
    return (
        <div className="ag-overlay-loading-center" style={{ backgroundColor: '#b4bebe', height: '9%' }}>
            <i className="far fa-frown"> {props.noRowsMessageFunc()}</i>
        </div>
    );
};
