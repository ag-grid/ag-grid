import React from 'react';

export default (props) => (
    <div>
        <span style={{
            borderLeft: '10px solid ' + props.value,
            paddingRight: '5px'
        }}></span>
        {props.value}
    </div>
)
