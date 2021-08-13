import React from 'react';

export default props => {
    return (
        <div className="ag-overlay-loading-center" style={{backgroundColor: 'lightsteelblue', height: '9%'}}>
            <i className="fas fa-hourglass-half"> {props.loadingMessage} </i>
        </div>
    );
};
