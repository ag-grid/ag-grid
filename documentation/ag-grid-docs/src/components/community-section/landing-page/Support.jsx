import styles from '@design-system/modules/community-section/landing-page/Support.module.scss';
import React, { useEffect, useRef, useState } from 'react';

const Support = () => {
    // Define an array of objects for the images and their corresponding text
    const images = [
        {
            src: '/community/support/stack-overflow.svg',
            text: 'Stack Overflow',
            desc: 'Have a question? Browse the AG Grid & AG Charts tags to leverage our community to help answer your questions',
            links: [
                {
                    "url": "https://stackoverflow.com/questions/tagged/ag-grid",
                    "text": "Grid"
                },
                {
                    "url": "https://stackoverflow.com/questions/tagged/ag-charts",
                    "text": "Charts"
                }
            ]
        },
        {
            src: '/community/support/github-white.svg',
            text: 'GitHub',
            desc: 'Found a bug? Raise a GitHub issue and one of our team will take a look',
            links: [
                {
                    "url": "https://github.com/ag-grid/ag-grid",
                    "text": "Grid"
                },
                {
                    "url": "https://github.com/ag-grid/ag-charts",
                    "text": "Charts"
                }
            ]
        },
        {
            src: '/community/support/zendesk.svg',
            text: 'Zendesk',
            desc: 'Enterprise user? Use Zendesk to request support from our dedicated in-house team',
            links: [
                {
                    "url": "https://ag-grid.zendesk.com/hc/en-us",
                    "text": "Open Ticket"
                }
            ]
        },
    ];

    return (
        <div className={styles.imageContainer}>
            {images.map((image, index) => (
                <div key={index} className={styles.imageItem}>
                    <img src={image.src} alt={`Image ${index + 1}`} />
                    <span className={styles.text}>{image.text}</span>
                    <span className={styles.desc}>{image.desc}</span>
                    <div className={styles.linkContainer}>
                        {image.links?.map((link, index) => (
                            <a target={'_blank'} className={styles.link} href={link.url}>{link.text}</a>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Support;
