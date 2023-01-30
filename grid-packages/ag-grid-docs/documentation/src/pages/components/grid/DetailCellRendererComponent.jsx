import React, { forwardRef } from 'react';
import styles from './DetailCellRendererComponent.module.scss';

const DetailCellRenderer = forwardRef((props, ref) => {
    return (
        <div ref={ref} className={styles.detailCellRenderer} dangerouslySetInnerHTML={{ __html: props.message }}></div>
    );
});

export default DetailCellRenderer;
