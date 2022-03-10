import React from 'react';
import classnames from 'classnames';
import fwLogos from 'images/fw-logos';
import supportedFrameworks from 'utils/supported-frameworks';
import styles from './FrameworkSelector.module.scss';

/**
 * This is shown in the header in the top right, and is used to choose which framework the user wishes to see for the
 * documentation.
 */
export default function FrameworkSelector({ frameworks, path, currentFramework }) {
    if (!currentFramework) { return null; }

    return <div className={styles['framework-selector']}>
        Framework:
        {supportedFrameworks
            .filter(f => !frameworks || frameworks.includes(f))
            .map(framework => {
                const isSelected = framework === currentFramework;
                const frameworkCapitalised = framework.charAt(0).toUpperCase() + framework.slice(1);
                const alt = `${frameworkCapitalised} Data Grid`;
                return <a href={path.replace(`/${currentFramework}-`, `/${framework}-`)} key={framework} className={classnames(styles['framework-selector__option'], { [styles['framework-selector__option--selected']]: isSelected })}>
                    <img src={fwLogos[framework]} alt={alt} className={styles['framework-selector__icon']} style={{height: 30, width: 30}} />
                </a>;
            })}
    </div>;
}
