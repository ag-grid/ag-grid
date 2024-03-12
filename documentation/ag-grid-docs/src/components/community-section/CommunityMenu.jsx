import styles from '@design-system/modules/CommunityMenu.module.scss';
import React, { useState } from 'react';
import menu from '../../content/community/community-menu.json';

const getPageFromPath = (path) => {
    return path.replace('community/', '');
}

const CommunityMenu = ({path}) => {
    const currPage = getPageFromPath(path)
    const [menuItems, setMenuItems] = useState(menu);

    return (
        <ul className={styles.communityMenu}>
            {menuItems.map((item) => (
                <li
                    key={item.name}
                    className={`${styles['community-menu-item']} ${currPage === item.path ? styles.selected : ''}`}
                >
                  <a href={'/community' + item.path}>
                    {item.name}</a>
                </li>
            ))}
        </ul>
    );
};

export default CommunityMenu;
