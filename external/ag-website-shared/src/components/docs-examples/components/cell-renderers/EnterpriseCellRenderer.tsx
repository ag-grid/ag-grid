import { EnterpriseIcon } from '@ag-website-shared/components/icon/EnterpriseIcon';

import type { CustomCellRendererProps } from 'ag-grid-react';

import styles from '../DocsExamples.module.scss';

export function EnterpriseCellRenderer({ data }: CustomCellRendererProps) {
    return data?.isEnterprise ? (
        <div className={styles.iconContainer}>
            <EnterpriseIcon />
        </div>
    ) : undefined;
}
