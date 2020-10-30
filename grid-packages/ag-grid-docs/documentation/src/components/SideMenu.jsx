import React from 'react';
import styles from './side-menu.module.scss';

const SideMenu = ({ headings }) =>
    <ul className={styles.sideNav}>
        {headings.map(heading => <li key={heading.id} className={`sideNav__itemLevel${heading.depth}`}>
            <a className={styles.sideNav__link} href={`#${heading.id}`}>{heading.value.replace(/<(.*?)>/g, '')}</a>
        </li>
        )}
    </ul>;

export default SideMenu;
