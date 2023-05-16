import React, { FunctionComponent, ReactNode } from 'react';
import styles from './TabsLinks.module.scss';

interface Props {
    children: ReactNode;
}

export const TabsLinks: FunctionComponent<Props> = ({ children }) => {
    return <div className={styles.externalLinks}>{children}</div>;
};
