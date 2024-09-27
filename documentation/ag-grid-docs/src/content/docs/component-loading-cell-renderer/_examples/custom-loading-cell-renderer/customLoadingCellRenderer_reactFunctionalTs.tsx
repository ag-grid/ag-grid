import React from 'react';

import type { CustomLoadingCellRendererProps } from 'ag-grid-react';

export default (props: CustomLoadingCellRendererProps & { loadingMessage: string }) => {
    return (
        <div className="ag-custom-loading-cell" style={{ paddingLeft: '10px', lineHeight: '25px' }}>
            <i className="fas fa-spinner fa-pulse"></i> <span> {props.loadingMessage}</span>
        </div>
    );
};
