import { Icon } from '@components/icon/Icon';
import styles from '@design-system/modules/community-section/landing-page/Support.module.scss';
import React from 'react';

import supportSites from '../../../content/community/support.json';

const Support = () => {
    return (
        <div className={styles.container}>
            {supportSites.map((site, index) => (
                <a target="_blank" href={site.link} className={styles.supportChannelContainer}>
                    <div key={index} className={styles.supportChannel}>
                        <div className={styles.header}>
                            <Icon alt={`${site.icon} logo`} name={site.icon} svgClasses={styles.siteIcon} />
                            <span className={styles.title}>{site.title}</span>
                        </div>
                        <span className={styles.desc}>{site.desc}</span>
                        <div className={styles.cta}>
                            <a>{site?.cta}</a>
                        </div>
                    </div>
                </a>
            ))}
        </div>
    );
};

export default Support;
