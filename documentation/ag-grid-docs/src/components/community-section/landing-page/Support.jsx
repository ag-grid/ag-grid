import styles from '@design-system/modules/community-section/landing-page/Support.module.scss';
import React, { useEffect, useRef, useState } from 'react';

const Support = () => {
    // Define an array of objects for the supportSites and their corresponding text
    const supportSites = [
        {
            src: '/community/support/stack-overflow.svg',
            text: 'Stack Overflow',
            desc: 'Have a question? Browse the AG Grid & AG Charts tags or create a new thread',
            link: "https://stackoverflow.com/questions/tagged/ag-grid"
        },
        {
            src: '/community/support/github-white.svg',
            text: 'GitHub',
            desc: 'Found a bug? Raise a GitHub issue and one of our team will take a look',
            link: "https://github.com/ag-grid/ag-grid",
        },
        {
            src: '/community/support/zendesk.svg',
            text: 'Zendesk',
            desc: 'Enterprise user? Use Zendesk to raise a ticket with our dedicated in-house team',
            link: "https://ag-grid.zendesk.com/hc/en-us",
        },
    ];

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
