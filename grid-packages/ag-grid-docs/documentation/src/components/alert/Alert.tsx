import classNames from 'classnames';
import React, { FunctionComponent, ReactNode } from 'react';
import { Icon } from '../Icon';
import styles from './Alert.module.scss';

interface Props {
    type: 'info' | 'idea' | 'warning' | 'default';
    children: ReactNode;
}

export const Alert: FunctionComponent<Props> = ({ type = 'default', children }) => {
    const icon = type !== 'default' ? type : null;

    return (
        <div className={classNames(styles.alert, styles[type])}>
            {icon && <Icon name={icon} />}

            <div className={styles.content}>{children}</div>
        </div>
    );
};
