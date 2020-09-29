import { Link } from 'gatsby';
import React from "react";
import './framework-selector.scss';

export default function FrameworkSelector({ path, currentFramework }) {
    if (!currentFramework) { return null; }

    return <div className="framework-selector">
        {['javascript', 'angular', 'react', 'vue'].map(framework => {
            return <Link
                key={framework}
                to={`${path.replace(`/${currentFramework}/`, `/${framework}/`)}`}
                className={`framework-thumbnail${framework === currentFramework ? ' selected' : ''}`}>
                <img src={`/fw-logos/${framework}.svg`} />
            </Link>;
        })}
    </div>;
}