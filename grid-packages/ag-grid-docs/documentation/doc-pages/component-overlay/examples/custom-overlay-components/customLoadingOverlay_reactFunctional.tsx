import React from 'react';
import { ICellRendererParams } from "@ag-grid-community/core";

export default (props: ICellRendererParams & { loadingMessage: string }) => {
    return (
        <div className="ag-overlay-loading-center">
            <div style={{height: 100, width: 100, background: 'url(https://ag-grid.com/images/ag-grid-loading-spinner.svg) center / contain no-repeat', margin: '0 auto'}}  aria-label="loading"></div>
            <div>{props.loadingMessage}</div>
        </div>
    );
};
