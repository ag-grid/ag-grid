import type { CustomCellRendererProps } from '@ag-grid-community/react';
import { type FunctionComponent } from 'react';

import styles from './StockCellRenderer.module.css';

export const StockCellRenderer: FunctionComponent<CustomCellRendererProps> = ({ data: { available, variants } }) => (
    <div className={styles.stock}>
        <span>{available}</span> <span className={styles.stockText}>Stock /</span>{' '}
        <span className={styles.variantsText}>{`${variants} Variants`}</span>
    </div>
);
