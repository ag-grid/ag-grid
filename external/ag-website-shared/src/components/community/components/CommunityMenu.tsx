import { addTrailingSlash } from '@ag-website-shared/utils/addTrailingSlash';
import { pathJoin } from '@utils/pathJoin';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';

import styles from './CommunityMenu.module.scss';

const getPageFromPath = (path: string) => {
    const prefix = urlWithBaseUrl('/community');
    return path.replace(`${prefix}`, '');
};

const CommunityMenu = ({ path, menu }: { path: string; menu: string }) => {
    const curPage = getPageFromPath(path);

    return (
        <ul className={styles.communityMenu}>
            {menu.map((item: string) => {
                const link = addTrailingSlash(urlWithBaseUrl(pathJoin('/community', item.path)));
                const isCurrentPage = curPage.replaceAll('/', '') === item.path.replaceAll('/', '');

                return (
                    <li
                        key={item.name}
                        className={`${styles['community-menu-item']} ${isCurrentPage ? styles.selected : ''}`}
                    >
                        <a href={link}>{item.name}</a>
                    </li>
                );
            })}
        </ul>
    );
};

export default CommunityMenu;
