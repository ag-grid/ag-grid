import { Icon } from '@ag-website-shared/components/icon/Icon';
import { Quotes } from '@components/quotes/Quotes';
import { quotesData } from '@components/quotes/quotesData';
import React from 'react';

import styles from './Customers.module.scss';

const Customers: React.FC = () => {
    return (
        <div className={styles.container}>
            {/* <div className={styles.statsContainer}>
                <div className={styles.stat1}>
                    <div className={styles.stat}>90%</div>
                    <div className={styles.statName}>of Fortune 500</div>
                </div>
                <div className={styles.stat2}>
                    <div className={styles.stat}>1M+</div>
                    <div className={styles.statName}>Weekly Downloads</div>
                </div>
                <div className={styles.stat3}>
                    <div className={styles.stat}>12K</div>
                    <div className={styles.statName}>GitHub Stars</div>
                </div>
            </div> */}
            <div className={styles.quotesContainer}>
                <Quotes data={quotesData} />
            </div>
            <div className={styles.customerLogos}></div>
        </div>
    );
};

export default Customers;
