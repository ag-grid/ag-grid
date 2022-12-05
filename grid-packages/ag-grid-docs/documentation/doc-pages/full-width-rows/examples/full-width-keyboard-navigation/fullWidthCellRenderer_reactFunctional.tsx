import React from "react"
import { ICellRendererParams } from '@ag-grid-community/core';

export default (props: ICellRendererParams) => {
    const { code, name, language } = props.data

    return (
        <div className="full-width-panel">
            <button>
                <img
                border="0"
                width="15"
                height="10"
                src={`https://www.ag-grid.com/example-assets/flags/${code}.png`}
                />
            </button>
            <input value={name} />
            <a href={`https://www.google.com/search?q=${language}`} target="_blank">
                {language}
            </a>
        </div>
    )
}
