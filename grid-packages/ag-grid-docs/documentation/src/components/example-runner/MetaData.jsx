import React from 'react';
import isDevelopment from 'utils/is-development';

const DEVELOPMENT_CSP = "default-src 'self'; script-src 'self'; script-src-elem 'self' 'unsafe-inline' localhost:8080 cdn.jsdelivr.net; connect-src 'self' cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src data:";

/**
 * This metadata is used across all examples. In development, we insert a timestamp to force the example to
 * hot-reload when a change is made.
 */
export const MetaData = ({ title, modifiedTimeMs, isExecuting, options: { metaCSP } }) =>
    <>
        <title>{title}</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {isExecuting && <meta name="robots" content="noindex" />}
        {isDevelopment() && <meta httpEquiv="last-modified" content={new Date(modifiedTimeMs).toString()} />}
        {metaCSP && <meta httpEquiv="content-security-policy" content={DEVELOPMENT_CSP} />}
    </>;

export default MetaData;