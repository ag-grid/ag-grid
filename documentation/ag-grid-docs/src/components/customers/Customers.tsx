import { CustomerLogos } from '@components/customer-logos/CustomerLogos';
import { Quotes } from '@components/quotes/Quotes';
import { quotesData } from '@components/quotes/quotesData';
import React, { type FunctionComponent } from 'react';

import styles from './Customers.module.scss';

interface Props {
    displayLogos: boolean;
}

const Customers: FunctionComponent<Props> = ({ displayLogos = true }) => {
    return (
        <div className={styles.container}>
            <div className={styles.quotesContainer}>
                <Quotes data={quotesData} />
            </div>
            {displayLogos && <CustomerLogos />}
        </div>
    );
};

export default Customers;
