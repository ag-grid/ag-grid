import { Icon } from '@ag-website-shared/components/icon/Icon';

import styles from './Support.module.scss';

const Support = ({ supportSites }) => {
    return (
        <div className={styles.container}>
            {supportSites.map((site, index) => (
                <a href={site.link} target="_blank" className={styles.supportChannelContainer} key={index}>
                    <div key={index} className={styles.supportChannel}>
                        <div className={styles.header}>
                            <Icon alt={`${site.icon} logo`} name={site.icon} svgClasses={styles.siteIcon} />
                            <span className={styles.title}>{site.title}</span>
                        </div>
                        <span className={styles.desc}>{site.desc}</span>
                        <div className={styles.cta}>{site?.cta}</div>
                    </div>
                </a>
            ))}
        </div>
    );
};

export default Support;
