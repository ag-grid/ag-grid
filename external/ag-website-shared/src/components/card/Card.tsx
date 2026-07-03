import classnames from 'classnames';
import type { FunctionComponent } from 'react';
import React from 'react';

import styles from './Card.module.scss';

interface Props {
    children?: React.ReactNode;
    link?: string;
    hoverLift?: boolean;
    className?: string;
    onClick?: () => void;
}

const Card: FunctionComponent<Props> = ({ children, link, hoverLift, className, onClick, ...props }) => {
    const cardClassName = classnames(styles.card, className, {
        [styles.hoverLift]: hoverLift,
    });
    return link ? (
        <a className={cardClassName} href={link} {...props}>
            {children}
        </a>
    ) : (
        <article className={cardClassName} onClick={onClick} {...props}>
            {children}
        </article>
    );
};

export default Card;
