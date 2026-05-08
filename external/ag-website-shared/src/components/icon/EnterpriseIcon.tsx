import type { CSSProperties, FunctionComponent } from 'react';

import styles from './EnterpriseIcon.module.scss';
import { Icon } from './Icon';

interface Props {
    style?: CSSProperties | string;
}

export const EnterpriseIcon: FunctionComponent<Props> = ({ style }) => {
    const styleObj: CSSProperties | undefined = typeof style === 'string' ? JSON.parse(style) : style;
    return (
        <span className={styles.enterpriseIcon} style={styleObj}>
            (e)
            <Icon name="enterprise" />
        </span>
    );
};
