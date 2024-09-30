import React from 'react';

import type { CustomHeaderProps } from 'ag-grid-react';

export default ({ displayName }: CustomHeaderProps) => {
    return (
        <div className="custom-header">
            <span>{displayName}</span>
            <button>Click me</button>
            <input defaultValue="120" />
            <a href="https://www.ag-grid.com" target="_blank">
                Link
            </a>
        </div>
    );
};
