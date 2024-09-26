import React from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

export default (props: CustomCellRendererProps) => {
    const { code, name, language } = props.data;

    return (
        <div className="full-width-panel">
            <button>
                <img width="15" height="10" src={`https://www.ag-grid.com/example-assets/flags/${code}.png`} />
            </button>
            <input defaultValue={name} />
            <a href={`https://www.google.com/search?q=${language}`} target="_blank">
                {language}
            </a>
        </div>
    );
};
