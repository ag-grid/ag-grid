import React from "react";

export default function ExampleRunner({ framework, name, title, type, options = '{}' }) {
    const parsedOptions = JSON.parse(options);

    return <div>
        <strong>Example: {title}</strong><br />
        This would be the {framework} example of "{name}" which is of type "{type}".
    </div>;
}