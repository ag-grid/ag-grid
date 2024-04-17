import { Icon } from '@ag-website-shared/components/icon/Icon';

import styles from './Socials.module.scss';

const Socials = ({ socialChannels }) => {
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
