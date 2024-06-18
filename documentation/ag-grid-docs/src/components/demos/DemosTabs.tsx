import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';

import styles from './Demos.module.scss';

const DemosTabs = ({ activeTab }) => {
    return (
        <div className={styles.tabs}>
            <div>
                <div className={`${styles.tabWrapper} ${activeTab === 'complete' && styles.tabActive}`}>
                    <a href={urlWithBaseUrl(`/example`)}>
                        <img
                            className={styles.showcaseItemTab}
                            src={urlWithBaseUrl(`/example/grid-full.png`)}
                            alt="Grid illustration"
                        />
                        <img
                            className={`${styles.showcaseItemTab} ${styles.darkTab}`}
                            src={urlWithBaseUrl(`/example/complete-dark.png`)}
                            alt="Grid illustration"
                        />
                    </a>
                </div>
                <span>Performance</span>
            </div>

            <div>
                <div className={`${styles.tabWrapper} ${activeTab === 'finance' && styles.tabActive}`}>
                    <a href={urlWithBaseUrl(`/example-finance`)}>
                        <img
                            className={styles.showcaseItemTab}
                            src={urlWithBaseUrl(`/example/finance-grid.png`)}
                            alt="Grid illustration"
                        />
                        <img
                            className={`${styles.showcaseItemTab} ${styles.darkTab}`}
                            src={urlWithBaseUrl(`/example/finance-dark.png`)}
                            alt="Grid illustration"
                        />
                    </a>
                </div>
                <span>Finance</span>
            </div>

            <div>
                <div className={`${styles.tabWrapper} ${activeTab === 'crm' && styles.tabActive}`}>
                    <a href={urlWithBaseUrl(`/example-hr`)}>
                        <img
                            className={styles.showcaseItemTab}
                            src={urlWithBaseUrl(`/example/crm-grid.png`)}
                            alt="Grid illustration"
                        />
                        <img
                            className={`${styles.showcaseItemTab} ${styles.darkTab}`}
                            src={urlWithBaseUrl(`/example/crm-dark.png`)}
                            alt="Grid illustration"
                        />
                    </a>
                </div>
                <span>HR</span>
            </div>

            <div>
                <div className={`${styles.tabWrapper} ${activeTab === 'inventory' && styles.tabActive}`}>
                    <a href={urlWithBaseUrl(`/example-inventory`)}>
                        <img
                            className={styles.showcaseItemTab}
                            src={urlWithBaseUrl(`/example/grid-inventory.png`)}
                            alt="Grid illustration"
                        />
                        <img
                            className={`${styles.showcaseItemTab} ${styles.darkTab}`}
                            src={urlWithBaseUrl(`/example/inventory-dark.png`)}
                            alt="Grid illustration"
                        />
                    </a>
                </div>
                <span>Inventory</span>
            </div>
        </div>
    );
};

export default DemosTabs;
