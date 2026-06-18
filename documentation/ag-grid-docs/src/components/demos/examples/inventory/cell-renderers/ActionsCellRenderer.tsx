import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import { type FunctionComponent, useCallback } from 'react';

import type { CustomCellRendererProps } from 'ag-grid-react';

import styles from './ActionsCellRenderer.module.css';

export const ActionsCellRenderer: FunctionComponent<CustomCellRendererProps> = ({ api, node }) => {
    const onRemoveClick = useCallback(() => {
        const rowData = node.data;
        api.applyTransaction({ remove: [rowData] });
    }, [node, api]);

    const onStopSellingClick = useCallback(() => {
        const rowData = node.data;

        const isPaused = rowData.status === 'paused';
        const isOutOfStock = rowData.available <= 0;

        // Create updated copy with the new status
        const updatedRowData = {
            ...rowData,
            status: !isPaused ? 'paused' : !isOutOfStock ? 'active' : 'outOfStock',
        };

        // Update the row node directly so the grid can locate the row without a getRowId
        node.updateData(updatedRowData);
    }, [node]);

    return (
        <div className={styles.buttonCell}>
            <button className={styles.removeButton} onClick={onRemoveClick}>
                <img src={urlWithBaseUrl(`/example/inventory/delete.svg`)} alt="delete" />
            </button>
            <button className={styles.buttonStopSelling} onClick={onStopSellingClick}>
                Hold Selling
            </button>
        </div>
    );
};
