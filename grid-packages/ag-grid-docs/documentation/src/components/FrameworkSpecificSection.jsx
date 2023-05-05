import React from 'react';
import ReactMarkdown, {uriTransformer} from 'react-markdown'
import convertToFrameworkUrl from '../utils/convert-to-framework-url';

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
    if (contentAsString.startsWith("\n|") || contentAsString.startsWith("|")) {
        return <ReactMarkdown
            transformLinkUri={(uri) => uriTransformer(convertToFrameworkUrl(uri, currentFramework))}
            children={contentAsString.replace(/^\|/gm, '').trim()}/>;
    }

    return <>{children}</>;
};

export default FrameworkSpecificSection;
