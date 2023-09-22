import React from 'react';

export default props => {
    return (
        <div className="ag-overlay-loading-center" style={{backgroundColor: '#b4bebe', height: '9%'}}>
            <i className="far fa-frown"> {props.noRowsMessageFunc()}</i>
        </div>
    );
};
