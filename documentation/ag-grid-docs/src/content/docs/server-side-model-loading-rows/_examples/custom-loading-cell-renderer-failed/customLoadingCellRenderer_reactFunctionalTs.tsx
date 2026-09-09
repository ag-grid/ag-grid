import React from 'react';

import type { CustomLoadingCellRendererProps } from 'ag-grid-react';

export default (props: CustomLoadingCellRendererProps & { loadingMessage: string }) => {
    if (props.node.failedLoad) {
        return (
            <div className="ag-custom-loading-cell" style={{ paddingLeft: '10px', lineHeight: '25px' }}>
                <i className="fas fa-times"></i>
                <span> Data failed to load</span>
            </div>
        );
    }
    return (
        <div className="ag-custom-loading-cell" style={{ paddingLeft: '10px', lineHeight: '25px' }}>
            <i className="fas fa-spinner fa-pulse"></i> <span> {props.loadingMessage}</span>
        </div>
    );
};
