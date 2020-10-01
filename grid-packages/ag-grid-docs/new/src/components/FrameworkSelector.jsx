import { Link } from 'gatsby';
import React from "react";
import './framework-selector.scss';

export default function FrameworkSelector({ path, currentFramework }) {
    if (!currentFramework) { return null; }

    return <div className="framework-selector">
        {['javascript', 'angular', 'react', 'vue'].map(framework => {
            const isSelected = framework === currentFramework;

            return <div key={framework} className={`framework-selector__option ${isSelected ? 'framework-selector__option--selected' : ''}`}>
                <Link
                    to={`${path.replace(`/${currentFramework}/`, `/${framework}/`)}`}
                    className="framework-selector__thumbnail">
                    <img src={`/fw-logos/${framework}.svg`} alt={framework} />
                </Link>
            </div>;
        })}
    </div>;
}
