import React from 'react';

import { FindPart } from 'ag-grid-community';
import { CustomCellRendererProps } from 'ag-grid-react';

import { getLatinText } from './data';

const PartsRenderer = ({ parts }: { parts: FindPart[] }) => {
    return (
        <p>
            {parts.map(({ value: partValue, match, activeMatch }, index) =>
                match ? (
                    <mark key={index} className={`ag-find-match${activeMatch ? ' ag-find-active-match' : ''}`}>
                        {partValue}
                    </mark>
                ) : (
                    partValue
                )
            )}
        </p>
    );
};

export default ({ api, node }: CustomCellRendererProps) => {
    const paragraphs = ['Sample Text in a Paragraph', ...getLatinText()];
    const textParts: FindPart[][] = [];
    let precedingNumMatches = 0;
    for (const paragraph of paragraphs) {
        const parts = api.findGetParts({
            value: paragraph,
            node,
            column: null,
            precedingNumMatches,
        });
        textParts.push(parts);
        precedingNumMatches += parts.filter((part) => part.match).length;
    }

    return (
        <div className="full-width-panel">
            <div className="full-width-flag">
                <img src={`https://www.ag-grid.com/example-assets/large-flags/${node.data.code}.png`} />
            </div>
            <div className="full-width-summary">
                <span className="full-width-title">{node.data.name}</span>
                <br />
                <label>
                    <b>Population:</b>
                    {node.data.population}
                </label>
                <br />
                <label>
                    <b>Language:</b>
                    {node.data.language}
                </label>
                <br />
            </div>
            <div className="full-width-center">
                {textParts.map((parts, index) => (
                    <PartsRenderer parts={parts} key={index} />
                ))}
            </div>
        </div>
    );
};
