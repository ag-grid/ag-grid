import styles from '@design-system/modules/CommunityMenu.module.scss';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import { useState } from 'react';

const getPageFromPath = (path) => {
    return path.replace('community/', '');
};

const CommunityMenu = ({ path, menu }) => {
    const currPage = getPageFromPath(path);
    const [menuItems, setMenuItems] = useState(menu);

    return (
        <ul className={styles.communityMenu}>
            {menuItems.map((item) => (
                <li
                    key={item.name}
                    className={`${styles['community-menu-item']} ${currPage === item.path ? styles.selected : ''}`}
                >
                    <a href={urlWithBaseUrl('/community' + item.path)}>{item.name}</a>
                </li>
            ))}
        </ul>
    );
};

export default CommunityMenu;
