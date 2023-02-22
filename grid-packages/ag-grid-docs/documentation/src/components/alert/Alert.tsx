import classnames from 'classnames';
import React, { FunctionComponent, ReactNode } from 'react';
import styles from './Alert.module.scss';

interface Props {
    type: 'info' | 'flag' | 'default';
    children: ReactNode;
}

export const Alert: FunctionComponent<Props> = ({ type = 'default', children }) => {
    return (
        <div
            className={classnames({
                [styles.alert]: true,
                [styles.info]: type === 'info',
                [styles.flag]: type === 'flag',
            })}
        >
            {children}
        </div>
    );
};
