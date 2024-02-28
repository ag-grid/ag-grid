import styles from '@design-system/modules/community-section/landing-page/Socials.module.scss';
import React, { useEffect, useRef, useState } from 'react';
import socialChannels from '../../../content/community/socials.json';

const Socials = () => {
    return (
        <div className={styles.container}>
            <div className={styles.socialChannelContainer}>
                {socialChannels.map((channel, index) => (
                    <a target={'_blank'} href={channel.link.url}>
                        <div key={index} className={styles.socialChannelItem}>
                            <img src={channel.src} alt={`Image ${index + 1}`} />
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default Socials;
