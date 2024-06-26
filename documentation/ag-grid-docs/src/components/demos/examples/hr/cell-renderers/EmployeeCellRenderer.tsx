import type { CustomCellRendererProps } from '@ag-grid-community/react';
import { getResourceUrl } from '@components/demos/examples/finance/utils/getResourceUrl';
import { type FunctionComponent } from 'react';

import styles from './EmployeeCellRenderer.module.css';

export const EmployeeCellRenderer: FunctionComponent<CustomCellRendererProps> = ({
    value,
    data: { image, jobTitle },
}) => (
    <div className={styles.employeeCell}>
        <div className={styles.employeeData}>
            <span>{value}</span>
            <span className={styles.description}>{jobTitle}</span>
        </div>
        <img className={styles.image} src={getResourceUrl(`/example/hr/${image}.png`)} alt={value.toLowerCase()} />
    </div>
);
