import { Icon } from '@components/icon/Icon';
import styles from '@design-system/modules/EnterpriseIcon.module.scss';
import type { FunctionComponent } from 'react';

export const EnterpriseIcon: FunctionComponent = () => {
    return (
        <span className={styles.enterpriseIcon}>
            (e)
            <Icon name="enterprise" />
        </span>
    );
};
