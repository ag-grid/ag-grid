import React from 'react';

export default function DetailCellRenderer(props) {
    return (
        <h1 className="custom-detail" style={{ padding: '20px' }}>
            {props.pinned != undefined ? props.pinned : 'center'}
        </h1>
    );
}
