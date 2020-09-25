import React from "react";

export default function FrameworkSpecificContent({ framework, children }) {
    const frameworkSpecificChild = children.filter(child => child.type === framework)[0];

    return <div>
        {frameworkSpecificChild.props.children}
    </div>;
}