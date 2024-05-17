import React from 'react';

export default (props) => {
    return (
        <div className="ag-custom-loading-cell" style={{ paddingLeft: '10px', lineHeight: '25px' }}>
            <i className="fas fa-spinner fa-pulse"></i> <span> {props.loadingMessage}</span>
        </div>
    );
};
