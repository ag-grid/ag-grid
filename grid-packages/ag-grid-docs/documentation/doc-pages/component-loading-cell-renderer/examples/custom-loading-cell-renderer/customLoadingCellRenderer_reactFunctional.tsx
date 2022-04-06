import React from 'react';
import { ILoadingCellRendererParams } from "@ag-grid-community/core";

export default (props: ILoadingCellRendererParams & { loadingMessage: string }) => {
    return (
        <div className="ag-custom-loading-cell" style={{ paddingLeft: '10px', lineHeight: '25px' }}>
            <i className="fas fa-spinner fa-pulse"></i> <span> {props.loadingMessage}</span>
        </div>
    );
};
