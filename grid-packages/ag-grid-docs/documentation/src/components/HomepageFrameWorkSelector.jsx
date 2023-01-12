import React from 'react';
import classnames from 'classnames';
import styles from './HomepageFrameworkSelector.module.scss';
import fwLogos from 'images/fw-logos';

/**
 * This is shown homepage below the hero, and allow the user navigate to the docs page for their favourite framework. 
 */

export default function HomepageFrameworkSelector({ frameworks }) {
    return (
        <div className={styles['framework-selector']}>
            {
                frameworks.map((framework) => {
                    const frameworkCapitalised = framework.charAt(0).toUpperCase() + framework.slice(1);
                    const alt = `${frameworkCapitalised} Data Grid`;
                    const href =  framework === 'solid' ? '/react-data-grid/solidjs/' : `/${framework}-data-grid/`;

                    return (
                        <a href={href} key={framework} className={styles['framework-selector__option']}>
                            <img src={fwLogos[framework]} alt={alt} />
                            <span>{frameworkCapitalised}</span>
                        </a>
                    )
                })
            }
        </div>
    );
}
