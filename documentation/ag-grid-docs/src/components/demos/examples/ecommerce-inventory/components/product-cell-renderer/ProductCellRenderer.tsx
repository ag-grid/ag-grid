import type { CustomCellRendererProps } from '@ag-grid-community/react';
import { getResourceUrl } from '@components/demos/examples/finance/utils/getResourceUrl';
import { type FunctionComponent } from 'react';

import styles from './ProductCellRenderer.module.css';

export const ProductCellRenderer: FunctionComponent<CustomCellRendererProps> = ({
    value,
    data: { image, category },
}) => (
    <div className={styles.productCell}>
        <div className={styles.image}>
            <img src={getResourceUrl(`/example/inventory/${image}.png`)} alt={image} />
        </div>
        <div>
            <div>{value}</div>
            <div className={styles.stockCell}>{category}</div>
        </div>
    </div>
);
