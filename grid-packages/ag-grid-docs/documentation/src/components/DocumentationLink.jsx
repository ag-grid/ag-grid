import React from 'react';
import { withPrefix } from 'gatsby';
import convertToFrameworkUrl from 'utils/convert-to-framework-url';

const prefixRegex = new RegExp(`^${withPrefix('/')}`);

/**
 * This takes a root-based page link (e.g. /getting-started/) and transforms it into one which is correct for the website
 * (e.g. /javascript-grid/getting-started/).
 */
export const DocumentationLink = ({ framework, href, children, ...props }) => {
    // strip the prefix is case it's been applied, before creating the proper URL
    const processedHref = href.startsWith('/') ?
        withPrefix(convertToFrameworkUrl(href.replace(prefixRegex, '/'), framework)) :
        href;

    return <a href={processedHref} {...props}>{children}</a>;
};

export default DocumentationLink;