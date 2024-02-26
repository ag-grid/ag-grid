import React from 'react';

export default function CustomPinnedRowRenderer(props) {
     return (
        <span style={props.style}>{props.value}</span>
    );    
};