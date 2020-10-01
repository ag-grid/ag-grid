import React from "react";

const FrameworkSpecificSection = ({ framework, children, ...otherProps }) => {
    const { className } = otherProps;

    if (className) {
        const frameworkBlockMatch = /^custom-block\s+(.*?)-only-section$/.exec(className);

        if (framework && frameworkBlockMatch && frameworkBlockMatch.length > 0) {
            // this is a framework-specific block, only render if required
            return frameworkBlockMatch[1] === framework ? <div {...otherProps}>{children}</div> : null;
        }
    }

    return <div {...otherProps}>{children}</div>;
};

export default FrameworkSpecificSection;