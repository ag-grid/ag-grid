import React from 'react';
import styles from './ListItem.module.scss';

export const ListItem = ({ children }) => <li className={styles['list-item']}>{children}</li>;