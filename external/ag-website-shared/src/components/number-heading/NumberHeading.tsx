import type { FunctionComponent } from 'react';
import React from 'react';

import styles from './Number.module.scss';

interface Props {
    number: string;
}

const NumberHeading: FunctionComponent<Props> = ({ number }) => {
    return <div className={styles.number}>{number}</div>;
};

export default NumberHeading;
