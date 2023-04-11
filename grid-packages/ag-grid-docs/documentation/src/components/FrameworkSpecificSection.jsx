import React from 'react';

const displayChildren = (frameworks, currentFramework) => frameworks.split(',').indexOf(currentFramework) !== -1;
/**
 * This shows an overview of the grid features.
 */
const FrameworkSpecificSection = ({frameworks, currentFramework, children}) => {
    if (!displayChildren(frameworks, currentFramework) || !children) {
        return null;
    }

    return <>{children}</>;
};

export default FrameworkSpecificSection;
