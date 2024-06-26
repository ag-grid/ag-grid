import type { CustomCellRendererProps } from '@ag-grid-community/react';
import { getResourceUrl } from '@components/demos/examples/finance/utils/getResourceUrl';
import { type FunctionComponent } from 'react';

import styles from './FlagRenderer.module.css';

export const FlagRenderer: FunctionComponent<CustomCellRendererProps> = ({ data: { flag, location } }) => (
    <div className={styles.flagCell}>
        <div className={styles.employeeData}>
            <span>{location}</span>
        </div>
        <img className={styles.image} src={getResourceUrl(`/example/hr/${flag}.svg`)} alt={location.toLowerCase()} />
    </div>
);
