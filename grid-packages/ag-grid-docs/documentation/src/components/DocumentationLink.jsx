import React from 'react';
import { withPrefix } from 'gatsby';
import convertToFrameworkUrl from 'utils/convert-to-framework-url';

/**
 * This takes a root-based page link (e.g. /getting-started/) and transforms it into one which is correct for the website
 * (e.g. /javascript-grid/getting-started/).
 */
export const DocumentationLink = ({ framework, href, children, ...props }) =>
    <a href={href.startsWith('/') ? withPrefix(convertToFrameworkUrl(href, framework)) : href} {...props}>{children}</a>;

export default DocumentationLink;