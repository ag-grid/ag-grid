import { Link, withPrefix } from 'gatsby';
import React from "react";
import styles from './framework-selector.module.scss';

export default function FrameworkSelector({ path, currentFramework }) {
    if (!currentFramework) { return null; }

    return <div className={styles.frameworkSelector}>
        {['javascript', 'angular', 'react', 'vue'].map(framework => {
            const isSelected = framework === currentFramework;

            return <div key={framework} className={`${styles.frameworkSelector__option} ${isSelected ? styles.frameworkSelector__optionSelected : ''}`}>
                <Link to={`${path.replace(`/${currentFramework}/`, `/${framework}/`)}`}>
                    <img src={withPrefix(`/fw-logos/${framework}.svg`)} alt={framework} />
                </Link>
            </div>;
        })}
    </div>;
}
