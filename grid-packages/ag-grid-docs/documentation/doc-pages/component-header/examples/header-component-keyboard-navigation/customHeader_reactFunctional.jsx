import React from 'react';

export default ({ displayName }) => {
    return (
        <div className="custom-header">
            <span>{displayName}</span>
            <button>Click me</button>
            <input value="120"/>
            <a href="https://ag-grid.com" target="_blank">Link</a>
        </div>
    );
}
