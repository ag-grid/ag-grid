import React from 'react';
import classnames from 'classnames';
import styles from './ListItem.module.scss';

export const ListItem = ({ className, children }) => {
    const isNavItem = className && className.indexOf('nav-item') !== -1;
    return <li className={classnames(styles['list-item'], { [styles['list-item--navitem']] : isNavItem})}>{children}</li>
};