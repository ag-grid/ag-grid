import React from 'react';
import ReactMarkdown from 'react-markdown'

const displayChildren = (frameworks, currentFramework) => {
    if (frameworks === 'frameworks') {
        return currentFramework !== 'javascript';
    }

    return frameworks.split(',').indexOf(currentFramework) !== -1;
}

/**
 * This shows an overview of the grid features.
 */
const FrameworkSpecificSection = ({frameworks, currentFramework, children}) => {
    if (!displayChildren(frameworks, currentFramework) || !children) {
        return null;
    }

    const contentAsString = children.toString();
    if(contentAsString.startsWith("\n|") || contentAsString.startsWith("|")) {
        return <ReactMarkdown children={contentAsString.replace(/^\|/gm, '').trim()}/>;
    }

    return <>{children}</>;
};

export default FrameworkSpecificSection;
