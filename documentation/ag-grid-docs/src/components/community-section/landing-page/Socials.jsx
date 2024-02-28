import styles from '@design-system/modules/community-section/landing-page/Socials.module.scss';
import React, { useEffect, useRef, useState } from 'react';

const Socials = () => {
    // Define an array of objects for the images and their corresponding text
    const images = [
        {
            src: '/community/socials/x-white.svg',
            text: 'X (Twitter)',
            desc: 'Found a bug? Raise a GitHub issue and one of our team will take a look',
            link: {
                "url": "https://twitter.com/aggrid",
                "text": "Follow"
            }
        },
        {
            src: '/community/socials/linkedin.svg',
            text: 'LinkedIn',
            desc: 'Found a bug? Raise a GitHub issue and one of our team will take a look',
            link: {
                "url": "https://www.linkedin.com/company/ag-grid/",
                "text": "Connect"
            }
        },
        {
            src: '/community/socials/youtube.svg',
            text: 'YouTube',
            desc: 'Enterprise user? Use Zendesk to request support from our dedicated in-house team',
            link: {
                "url": "https://youtube.com/c/ag-grid",
                "text": "Subscribe"
            }
        },
        {
            src: '/community/socials/blog.svg',
            text: 'Blog',
            desc: 'Havess a question? Browse the AG Grid & AG Charts tags to leverage our community to help answer your questions',
            link: {
                "url": "https://blog.ag-grid.com",
                "text": "Browse"
            }
        },
        {
            src: '/community/socials/mailchimp.svg',
            text: 'Newsletter',
            desc: 'Enterprise user? Use Zendesk to request support from our dedicated in-house team',
            link: {
                "url": "https://blog.ag-grid.com/newsletter",
                "text": "Join"
            }
        },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.imageContainer}>
                {images.map((image, index) => (
                    <a target={'_blank'} href={image.link.url}>
                        <div key={index} className={styles.imageItem}>
                            <img src={image.src} alt={`Image ${index + 1}`} />
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default Socials;
