import React from 'react';
import isDevelopment from 'utils/is-development';

/**
 * This metadata is used across all examples. In development, we insert a timestamp to force the example to
 * hot-reload when a change is made.
 */
export const MetaData = ({ title, modifiedTimeMs, isExecuting }) =>
    <>
        <title>{title}</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {isExecuting && <meta name="robots" content="noindex" />}
        {isDevelopment() && <meta httpEquiv="last-modified" content={new Date(modifiedTimeMs).toString()} />}
    </>;

export default MetaData;