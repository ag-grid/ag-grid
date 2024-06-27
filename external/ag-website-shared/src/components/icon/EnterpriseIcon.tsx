import type { FunctionComponent } from 'react';

import styles from './EnterpriseIcon.module.scss';
import { Icon } from './Icon';

export const EnterpriseIcon: FunctionComponent = () => {
    return (
        <span className={styles.enterpriseIcon}>
            (e)
            <Icon name="enterprise" />
        </span>
    );
};
