import { type FunctionComponent } from 'react';

import styles from './ProductDetailsRenderer.module.css';

interface Props {}

export const ProductDetailsRenderer: FunctionComponent<Props> = () => {
    return (
        <div className={styles.productCell}>
            <div className={styles.productData}>
                <span className={styles.productDetails}>Office Supplies Allowance</span>
            </div>
        </div>
    );
};
