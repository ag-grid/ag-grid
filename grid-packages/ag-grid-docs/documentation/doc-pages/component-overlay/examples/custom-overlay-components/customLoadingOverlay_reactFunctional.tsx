import React from 'react';
import { ICellRendererParams } from "@ag-grid-community/core";

export default (props: ICellRendererParams & { loadingMessage: string }) => {
    return (
        <div className="ag-overlay-loading-center" style={{ backgroundColor: 'lightsteelblue', height: '9%' }}>
            <i className="fas fa-hourglass-half"> {props.loadingMessage} </i>
        </div>
    );
};
