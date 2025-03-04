import type { FunctionComponent, ReactNode } from 'react';
import React from 'react';

import styles from './Number.module.scss';

interface Props {
    children: ReactNode;
    number: string;
    title: string;
    level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const NumberHeading: FunctionComponent<Props> = ({ level, title, number, children }) => {
    const Heading = level;

    return (
        <div className={styles.numberHeading}>
            <div className={styles.number}> {number}</div>
            <div className={styles.content}>
                {' '}
                <Heading>{title}</Heading>
                <div>{children}</div>
            </div>
        </div>
    );
};

export default NumberHeading;
