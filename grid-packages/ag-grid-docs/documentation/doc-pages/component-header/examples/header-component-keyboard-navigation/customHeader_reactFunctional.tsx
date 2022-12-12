import React from "react"
import { IHeaderParams } from '@ag-grid-community/core'

export default ({ displayName }: IHeaderParams) => {
    return (
        <div className="custom-header">
            <span>{displayName}</span>
            <button>Click me</button>
            <input value="120"/>
            <a href="https://ag-grid.com" target="_blank">Link</a>
        </div>
    )
};
