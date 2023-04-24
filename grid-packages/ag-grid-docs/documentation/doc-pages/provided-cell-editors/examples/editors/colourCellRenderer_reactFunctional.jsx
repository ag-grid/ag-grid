import React from 'react';

export default (props) => (
    <span style={{
                borderLeft: '10px solid ' + props.value,
                paddingLeft: '5px'
            }}>{props.value}</span>
)
