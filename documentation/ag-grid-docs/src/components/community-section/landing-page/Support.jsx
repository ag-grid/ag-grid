import styles from '@design-system/modules/community-section/landing-page/Support.module.scss';
import React, { useEffect, useRef, useState } from 'react';
import supportSites from '../../../content/community/support.json';

const Support = () => {

    return (
        <div className={styles.supportChannelContainer}>
            {supportSites.map((site, index) => (
                <a target='_blank' className={styles.link} href={site.link}>
                    <div key={index} className={styles.supportChannel}>
                        <div className={styles.header}>
                            <img src={site.src} alt={`Image ${index + 1}`} />
                            <span className={styles.text}>{site.text}</span>
                        </div>
                        <span className={styles.desc}>{site.desc}</span>
                    </div>
                </a>
            ))}
        </div>
    );
};

export default Support;
