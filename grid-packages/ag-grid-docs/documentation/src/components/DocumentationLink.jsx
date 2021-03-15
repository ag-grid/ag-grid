import React from 'react';
import { convertUrl } from './documentation-helpers';

/**
 * Creates anchor links with automatically-converted URLs.
 */
export const DocumentationLink = ({ framework, href, children, ...props }) => {
    return <a href={convertUrl(href, framework)} {...props}>{children}</a>;
};


export default DocumentationLink;