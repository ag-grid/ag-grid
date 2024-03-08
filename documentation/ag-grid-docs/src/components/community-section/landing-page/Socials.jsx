import { Icon } from '@components/icon/Icon';
import styles from '@design-system/modules/community-section/landing-page/Socials.module.scss';
import React, { useEffect, useRef, useState } from 'react';

import socialChannels from '../../../content/community/socials.json';

const Socials = () => {
    return (
        <div className={styles.socialChannelContainer}>
            {socialChannels.map((channel, index) => (
                <a target={'_blank'} href={channel.url}>
                    <div key={index}>
                        <Icon alt={`${channel.icon} logo`} name={channel.icon} svgClasses={styles.socialChannelIcon} />
                    </div>
                </a>
            ))}
        </div>
    );
};

export default Socials;
