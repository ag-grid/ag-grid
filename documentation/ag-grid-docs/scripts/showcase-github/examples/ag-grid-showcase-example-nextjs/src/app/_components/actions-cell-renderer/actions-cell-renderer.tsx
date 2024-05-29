import { type FunctionComponent } from 'react';

import styles from './actions-cell-renderer.module.css';

export const ActionsCellRenderer: FunctionComponent = () => {
    const imgSrc = `/example/finance/icons/documentation.svg`;
    return (
        <button className={`button-secondary ${styles.advice}`}>
            <img src={imgSrc} className={styles.adviceIcon} alt="Documentation icon" />
        </button>
    );
};
