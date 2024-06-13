import { getResourceUrl } from '@components/demos/examples/portfolio-positions/utils/getResourceUrl';
import { type FunctionComponent } from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

import styles from './StatusCellRenderer.module.css';

export const StatusCellRenderer: FunctionComponent<CustomCellRendererProps> = ({ data }) => {
    const status = data.paymentStatus;
    let containerClass: string = '';
    const tick = getResourceUrl(`/example/hr/tick.svg`);

    // Assign different classes based on the department name
    switch (status) {
        case 'Paid':
            containerClass = styles.paidTag;
            break;
        case 'Engineering':
            containerClass = styles.engineeringTag;
            break;
        case 'Executive Management':
            containerClass = styles.executiveManagementTag;
            break;
        case 'Product':
            containerClass = styles.productTag;
            break;
        default:
            containerClass = styles.defaultTag; // Optional: for departments not listed
    }

    return (
        <div className={`${styles.tag} ${containerClass}`}>
            {status === 'Paid' && <img className={styles.tick} src={tick} alt="Tick" />}
            <span>{status}</span>
        </div>
    );
};
