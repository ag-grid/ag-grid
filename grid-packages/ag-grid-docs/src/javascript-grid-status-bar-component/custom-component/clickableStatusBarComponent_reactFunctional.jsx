import React from 'react';

export default props => {
    const onClick = () => {
        alert('Selected Row Count: ' + props.api.getSelectedRows().length)
    }

    return (
        <div className="ag-status-name-value">
                <span>Status Bar Component&nbsp;
                    <input type="button" onClick={() => onClick()} value="Click Me"/>
                </span>
        </div>
    );
};

