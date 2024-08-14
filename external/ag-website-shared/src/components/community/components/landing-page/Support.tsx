import { Icon } from '@ag-website-shared/components/icon/Icon';

import styles from './Support.module.scss';

const Support = ({ supportSites, currentSite }) => {
    return (
        <div className={styles.container}>
            {supportSites.map((supportSite, index) => {
                return (
                    <a
                        href={currentSite === 'grid' ? supportSite.gridLink : supportSite.chartsLink}
                        target="_blank"
                        className={styles.supportChannelContainer}
                        key={index}
                    >
                        <div key={index} className={styles.supportChannel}>
                            <div className={styles.header}>
                                <Icon
                                    alt={`${supportSite.icon} logo`}
                                    name={supportSite.icon}
                                    svgClasses={styles.siteIcon}
                                />
                                <span className={styles.title}>{supportSite.title}</span>
                            </div>
                            <span className={styles.desc}>{supportSite.desc}</span>
                            <div className={styles.cta}>{supportSite?.cta}</div>
                        </div>
                    </a>
                );
            })}
        </div>
    );
};

export default Support;
