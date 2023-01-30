import classnames from 'classnames';
import fwLogos from 'images/fw-logos';
import React from 'react';
import styles from './FrameworkSelector.module.scss';

// This is shown on the homepage, and in the top right of the documentation pages.
// It is used to allow users to choose which framework they wish to see documentation for.

export default function FrameworkSelector({ data, currentFramework, isFullWidth, showSelectedFramework }) {
    return (
        <div
            className={classnames(styles['frameworkSelector'], {
                [styles['fullWidth']]: isFullWidth,
                [styles['showSelected']]: showSelectedFramework,
            })}
        >
            {data.map((framework) => {
                const isSelected = showSelectedFramework && framework.name === currentFramework;
                const frameworkCapitalised = framework.name.charAt(0).toUpperCase() + framework.name.slice(1);
                const alt = `${frameworkCapitalised} Data Grid`;

                return (
                    <a
                        href={framework.url}
                        key={framework.name}
                        className={classnames(styles['option'], {
                            [styles['selected']]: isSelected,
                        })}
                    >
                        <img src={fwLogos[framework.name]} alt={alt} />
                        <span>{frameworkCapitalised}</span>
                    </a>
                );
            })}
        </div>
    );
}
