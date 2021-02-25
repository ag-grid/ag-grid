import React from 'react';
import { withPrefix } from 'gatsby';

/**
 * This takes a root-based link (e.g. /getting-started/) and transforms it into one which is correct for the website
 * (e.g. /documentation/javascript/getting-started/).
 */
export const DocumentationLink = ({ framework, href, children, ...props }) =>
    <a href={withPrefix(`/${framework}${href}`)} {...props}>{children}</a>;
;

export default DocumentationLink;