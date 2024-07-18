import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import { urlWithPrefix } from '@utils/urlWithPrefix';
import classnames from 'classnames';
import React from 'react';

import styles from './FrameworkSelector.module.scss';

const fwLogos = 'images/fw-logos/';

export default function FrameworkSelector({ data, currentFramework, isFullWidth, showSelectedFramework }) {
    return (
        <div
            className={classnames(styles.frameworkSelector, {
                [styles.fullWidth]: isFullWidth,
                [styles.showSelected]: showSelectedFramework,
            })}
        >
            {data.map((framework) => {
                const isSelected = showSelectedFramework && framework.name === currentFramework;
                const frameworkCapitalised = framework.name.charAt(0).toUpperCase() + framework.name.slice(1);
                const alt = `${frameworkCapitalised} Data Grid`;

                return (
                    <a
                        href={urlWithPrefix({ url: './getting-started', framework: framework.name })}
                        key={framework.name}
                        className={classnames(styles.option, {
                            [styles.selected]: isSelected,
                        })}
                    >
                        <img src={urlWithBaseUrl(`/${fwLogos}${framework.name}.svg`)} alt={alt} />
                        <span>{frameworkCapitalised}</span>
                    </a>
                );
            })}
        </div>
    );
}
