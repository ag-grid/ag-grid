import React from 'react';

export default props => {
    return (
        <div className="ag-overlay-loading-center">
               <object style={{height: 100, width: 100}} type="image/svg+xml" data="https://ag-grid.com/images/ag-grid-loading-spinner.svg" aria-label="loading"></object>
               <div>  {props.loadingMessage} </div>
            </div>
    );
};
