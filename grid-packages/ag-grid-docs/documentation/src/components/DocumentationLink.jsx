import React from 'react';
import { withPrefix } from 'gatsby';

export const DocumentationLink = ({ framework, href, children, ...props }) =>
    <a href={withPrefix(`/${framework}${href}`)} {...props}>{children}</a>;
;

export default DocumentationLink;