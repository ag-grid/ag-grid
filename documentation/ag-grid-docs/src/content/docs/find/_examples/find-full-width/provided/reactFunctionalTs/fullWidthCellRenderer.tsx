import React from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

import { getLatinText } from './data';

export default ({ api, node }: CustomCellRendererProps) => {
    const originalSampleText = 'Sample Text in a Paragraph';
    const originalLatinText = getLatinText();
    const sampleTextParts = api.findGetParts({
        value: originalSampleText,
        node,
        column: null,
    });
    const sampleText = sampleTextParts.length ? sampleTextParts : [{ value: originalSampleText }];
    const precedingNumMatches = sampleTextParts.filter((part) => part.match).length;
    const latinTextParts = api.findGetParts({
        value: originalLatinText,
        node,
        column: null,
        precedingNumMatches,
    });
    const latinText = latinTextParts.length ? latinTextParts : [{ value: originalLatinText }];

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
                <p>
                    {sampleText.map(({ value: partValue, match, activeMatch }, index) =>
                        match ? (
                            <mark key={index} className={`ag-find-match${activeMatch ? ' ag-find-active-match' : ''}`}>
                                {partValue}
                            </mark>
                        ) : (
                            partValue
                        )
                    )}
                </p>
                <p>
                    {latinText.map(({ value: partValue, match, activeMatch }, index) =>
                        match ? (
                            <mark key={index} className={`ag-find-match${activeMatch ? ' ag-find-active-match' : ''}`}>
                                {partValue}
                            </mark>
                        ) : (
                            partValue
                        )
                    )}
                </p>
            </div>
        </div>
    );
};
