import { Link } from 'gatsby';
import React from 'react';
import fwLogos from '../images/fw-logos';
import styles from './framework-selector.module.scss';
import supportedFrameworks from '../utils/supported-frameworks';

export default function FrameworkSelector({ frameworks, path, currentFramework }) {
    if (!currentFramework) { return null; }

    return <div className={styles.frameworkSelector}>
        {supportedFrameworks.filter(f => frameworks.includes(f)).map(framework => {
            const isSelected = framework === currentFramework;

            return <div key={framework} className={`${styles.frameworkSelector__option} ${isSelected ? styles.frameworkSelector__optionSelected : ''}`}>
                <Link to={`${path.replace(`/${currentFramework}/`, `/${framework}/`)}`}>
                    <img src={fwLogos[framework]} alt={framework} />
                </Link>
            </div>;
        })}
    </div>;
}
