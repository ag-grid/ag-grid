import React from 'react';
import { CustomNoRowsOverlayProps } from "@ag-grid-community/react";

export default (props: CustomNoRowsOverlayProps & { noRowsMessageFunc: () => string }) => {
    return (
        <div className="ag-overlay-loading-center" style={{ backgroundColor: '#b4bebe', height: '9%' }}>
            <i className="far fa-frown"> {props.noRowsMessageFunc()}</i>
        </div>
    );
};
