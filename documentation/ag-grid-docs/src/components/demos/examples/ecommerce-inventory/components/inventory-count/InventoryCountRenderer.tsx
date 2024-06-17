import { type FunctionComponent } from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

import styles from './InventoryCount.module.css';

export const InventoryCountRenderer: FunctionComponent<CustomCellRendererProps> = ({ data }) => {
    return (
        <div className={styles.stock}>
            <span>{data.available}</span> <span className={styles.stockText}>Stock /</span> 1{' '}
            <span className={styles.variantsText}>Variants</span>
        </div>
    );
};
