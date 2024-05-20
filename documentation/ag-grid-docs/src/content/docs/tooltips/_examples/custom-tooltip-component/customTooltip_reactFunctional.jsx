import React, { useMemo } from 'react';

export default (props) => {
    return (
        <div className="custom-tooltip" style={{ backgroundColor: props.color || '#999' }}>
            <div>
                <b>Custom Tooltip</b>
            </div>
            <div>{props.value}</div>
        </div>
    );
};
