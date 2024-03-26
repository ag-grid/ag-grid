import type { FooterItem } from '@ag-grid-types';
import { SiteLogo } from '@components/SiteLogo';
import { Icon } from '@components/icon/Icon';
import { SITE_BASE_URL } from '@constants';
import styles from '@design-system/modules/Footer.module.scss';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import classNames from 'classnames';

interface FooterProps {
    path: string;
    footerItems: FooterItem[];
}

const MenuColumns = ({ footerItems }: { footerItems: FooterItem[] }) =>
    footerItems.map(({ title, links }) => (
        <div key={title} className={styles.menuColumn}>
            <h4>{title}</h4>
            <ul className="list-style-none">
                {links.map(({ name, url, newTab, iconName }: any) => (
                    <li key={`${title}_${name}`}>
                        <a href={urlWithBaseUrl(url)} {...(newTab ? { target: '_blank', rel: 'noreferrer' } : {})}>
                            {iconName && <Icon name={iconName} />}
                            {name}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    ));

export const Footer = ({ path, footerItems }: FooterProps) => {
    // Filter items with icons
    const iconItems = footerItems.flatMap(({ title, links }) =>
        links
            .filter(({ iconName }) => iconName)
            .map(({ name, url, newTab, iconName }) => ({
                title,
                name,
                url,
                newTab,
                iconName,
            }))
    );

    return (
        <footer className={styles.footer}>
            <div className={classNames(styles.footerColumns, 'layout-grid')}>
                <div className={styles.menuColumn}>
                    <div className={styles.logoContainer}>
                        <SiteLogo />
                    </div>

                    <p className="text-sm">&copy; AG Grid Ltd. 2015-{new Date().getFullYear()}</p>

                    <p className="text-sm">
                        AG Grid Ltd registered in the United Kingdom. Company&nbsp;No.&nbsp;07318192.
                    </p>

                    {(path === SITE_BASE_URL || path === undefined) && (
                        <p className="text-sm">
                            The Microsoft logo is a trademark of the Microsoft group of companies.
                        </p>
                    )}
                </div>
                <MenuColumns footerItems={footerItems} />
            </div>
        </footer>
    );
};
