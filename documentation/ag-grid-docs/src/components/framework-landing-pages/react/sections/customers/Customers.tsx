import { Quotes } from '@components/quotes/Quotes';
import { quotesData } from '@components/quotes/quotesData';
import React from 'react';

import styles from './Customers.module.scss';

const Customers: React.FC = () => {
    return (
        <div className={styles.container}>
            <div className={styles.quotesContainer}>
                <Quotes data={quotesData} />
            </div>
            <div className={styles.customerLogos}></div>
        </div>
    );
};

export default Customers;
