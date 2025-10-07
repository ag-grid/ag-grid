import React from 'react';

import styles from './CustomerLogos.module.scss';

export const CustomerLogos: React.FC = () => {
    return (
        <div className={styles.customerLogosOuter}>
            <div className={styles.customerLogos}></div>
        </div>
    );
};
