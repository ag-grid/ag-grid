import React from "react"
import { CustomHeaderProps } from '@ag-grid-community/react'

export default ({ displayName }: CustomHeaderProps) => {
    return (
        <div className="custom-header">
            <span>{displayName}</span>
            <button>Click me</button>
            <input defaultValue="120" />
            <a href="https://ag-grid.com" target="_blank">Link</a>
        </div>
    )
};
