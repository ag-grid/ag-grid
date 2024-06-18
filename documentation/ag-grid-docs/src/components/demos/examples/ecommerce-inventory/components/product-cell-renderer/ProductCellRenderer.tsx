import { getResourceUrl } from '@components/demos/examples/finance/utils/getResourceUrl';
import { type FunctionComponent } from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

import styles from './ProductCellRenderer.module.css';

export const ProductCellRenderer: FunctionComponent<CustomCellRendererProps> = ({ data }) => {
    const { product, image, category } = data;
    const productName = data.product;
    const imgSrc = getResourceUrl(`/example/inventory/${image}.png`);

    return (
        <div className={styles.productCell}>
            <div className={styles.image}>
                <img src={imgSrc} alt={image} />
            </div>
            <div>
                <div>{product}</div>
                <div className={styles.stockCell}>{category}</div>
            </div>
        </div>
    );
};
