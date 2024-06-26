import type { CustomCellRendererProps } from '@ag-grid-community/react';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import { type FunctionComponent } from 'react';

import styles from './StatusCellRenderer.module.css';

export const StatusCellRenderer: FunctionComponent<CustomCellRendererProps> = ({ value }) => (
    <div className={`${styles.tag} ${styles[value + 'Tag']}`}>
        {value === 'paid' && <img className={styles.tick} src={urlWithBaseUrl(`/example/hr/tick.svg`)} alt="tick" />}
        <span>{value}</span>
    </div>
);
