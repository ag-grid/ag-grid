import React from 'react';

export default (props) => {
    return (
        <div
            role="presentation"
            className="ag-overlay-loading-center"
            style={{ backgroundColor: '#b4bebe', height: '9%' }}
        >
            <i className="far fa-frown" aria-live="polite" aria-atomic="true">
                {' '}
                {props.noRowsMessageFunc()}
            </i>
        </div>
    );
};
