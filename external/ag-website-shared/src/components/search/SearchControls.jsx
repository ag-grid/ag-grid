import { Icon } from '@ag-website-shared/components/icon/Icon';
import React from 'react';

import styles from './SearchControls.module.scss';

export default () => (
    <div className={styles.controlsOuter}>
        <div className={styles.keyboardSection}>
            <span className={styles.kbdIcon}>
                <Icon name="return" />
            </span>
            <span>to select</span>
        </div>

        <div className={styles.keyboardSection}>
            <span className={styles.kbdIcon}>
                <Icon name="arrowUp" />
            </span>
            <span className={styles.kbdIcon}>
                <Icon name="arrowDown" />
            </span>
            <span>to navigate</span>
        </div>

        <div className={styles.keyboardSection}>
            <span className={styles.kbdIcon}>
                <Icon name="escape" />
            </span>
            <span>to close</span>
        </div>
    </div>
);
