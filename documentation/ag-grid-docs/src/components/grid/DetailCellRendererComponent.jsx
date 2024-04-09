import styles from '@legacy-design-system/modules/DetailCellRendererComponent.module.scss';
import React, { forwardRef } from 'react';

const DetailCellRenderer = forwardRef((props, ref) => {
    return (
        <div ref={ref} className={styles.detailCellRenderer} dangerouslySetInnerHTML={{ __html: props.message }}></div>
    );
});

export default DetailCellRenderer;
