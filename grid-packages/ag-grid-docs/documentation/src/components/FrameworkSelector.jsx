import { Link } from 'gatsby';
import React from 'react';
import classnames from 'classnames';
import fwLogos from '../images/fw-logos';
import supportedFrameworks from '../utils/supported-frameworks';
import styles from './FrameworkSelector.module.scss';

export default function FrameworkSelector({ frameworks, path, currentFramework }) {
    if (!currentFramework) { return null; }

    return <div className={styles['framework-selector']}>
        {supportedFrameworks.filter(f => frameworks.includes(f)).map(framework => {
            const isSelected = framework === currentFramework;

            return <div key={framework} className={classnames(styles['framework-selector__option'], { [styles['framework-selector__option--selected']]: isSelected })}>
                <Link to={ path.replace(`/${currentFramework}/`, `/${framework}/`) }>
                    <img src={ fwLogos[framework]} alt={ framework } />
                </Link>
            </div>;
        })}
    </div>;
}
