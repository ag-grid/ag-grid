import classnames from 'classnames';
import React from 'react';

import styles from './Pill.module.scss';

interface PillProps {
    text: string;
    color: 'blue' | 'green' | 'yellow' | 'red';
    dot?: boolean;
    className?: string;
}

const Pill: React.FC<PillProps> = ({ text, color, dot = false, className }) => {
    return (
        <span
            className={classnames(styles.pill, styles[color], className, {
                [styles.dot]: dot,
            })}
        >
            {text}
        </span>
    );
};

export default Pill;
