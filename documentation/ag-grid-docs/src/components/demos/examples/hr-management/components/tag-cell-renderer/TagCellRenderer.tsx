import { type CustomCellRendererProps } from '@ag-grid-community/react';
import { type FunctionComponent } from 'react';

import styles from './TagCellRenderer.module.css';

export const TagCellRenderer: FunctionComponent<CustomCellRendererProps> = ({ data: { department, departmentId } }) => (
    <div className={`${styles.tag} ${styles[departmentId + 'Tag']}`}>
        <div className={`${styles.circle} ${styles[departmentId + 'Circle']}`}></div>
        <span>{department}</span>
    </div>
);
