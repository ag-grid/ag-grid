import { Icon } from '@components/icon/Icon';
import styles from '@design-system/modules/CommunitySocials.module.scss';
import React, { useEffect, useRef, useState } from 'react';

import socialChannels from '../../../content/community/socials.json';

const Socials = () => {
    return (
        <div className={styles.socialChannelContainer}>
            {socialChannels.map((channel, index) => (
                <a target={'_blank'} href={channel.url} key={index}>
                    <div key={index}>
                        <Icon alt={`${channel.icon} logo`} name={channel.icon} svgClasses={styles.socialChannelIcon} />
                    </div>
                </a>
            ))}
        </div>
    );
};

export default Socials;
