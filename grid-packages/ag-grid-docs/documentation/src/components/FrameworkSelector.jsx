import React from 'react';
import classnames from 'classnames';
import fwLogos from 'images/fw-logos';
import supportedFrameworks from 'utils/supported-frameworks';
import styles from './FrameworkSelector.module.scss';

export default function FrameworkSelector({ frameworks, path, currentFramework }) {
    if (!currentFramework) { return null; }

    return <div className={styles['framework-selector']}>
        Framework:
        {supportedFrameworks
            .filter(f => !frameworks || frameworks.includes(f))
            .map(framework => {
                const isSelected = framework === currentFramework;

                return <a href={path.replace(`/${currentFramework}/`, `/${framework}/`)} key={framework} className={classnames(styles['framework-selector__option'], { [styles['framework-selector__option--selected']]: isSelected })}>
                    <img src={fwLogos[framework]} alt={framework} className={styles['framework-selector__icon']} />
                </a>;
            })}
    </div>;
}
