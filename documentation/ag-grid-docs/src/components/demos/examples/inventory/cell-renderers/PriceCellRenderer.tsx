import { type FunctionComponent } from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

import styles from './PriceCellRenderer.module.css';

export const PriceCellRenderer: FunctionComponent<CustomCellRendererProps> = ({ value, data: { priceIncrease } }) => (
    <div className={styles.price}>
        <span className={styles.priceAmount}>{'£' + value}</span>
        <span className={styles.increase}>{priceIncrease + '% increase'}</span>
    </div>
);
