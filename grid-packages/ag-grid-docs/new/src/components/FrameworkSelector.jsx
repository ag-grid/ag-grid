import React from "react";
import './framework-selector.css';

export default function FrameworkSelector({ currentFramework }) {
    if (!currentFramework) { return null; }

    const changeFramework = framework => {
        const url = window.location.href;
        const newUrl = url.replace(`/${currentFramework}/`, `/${framework}/`);

        window.location.href = newUrl;
    };

    return <div className="framework-selector">
        {['javascript', 'angular', 'react', 'vue'].map(framework =>
            <div key={framework} onClick={() => changeFramework(framework)}>
                <img className={framework === currentFramework ? "selected" : ""} src={`/fw-logos/${framework}.svg`} />
            </div>)}
    </div>;
}