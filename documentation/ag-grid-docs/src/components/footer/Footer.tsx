import type { FooterItem } from '@ag-grid-types';
import { Icon } from '@components/icon/Icon';
import { SITE_BASE_URL } from '@constants';
import styles from '@design-system/modules/Footer.module.scss';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import classNames from 'classnames';

import LogoMarkTransparentSVG from '../../images/inline-svgs/ag-grid-logomark.svg?react';

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
                {/* Section with title, subtitle, and icons */}
                <div className={styles.menuColumn}>
                    <LogoMarkTransparentSVG className={styles.gridIcon} />
                    <h2 className={styles.headerTitle}>AG Grid</h2>
                    <p className={styles.subtitle}>&copy; AG Grid Ltd. 2015-{new Date().getFullYear()}</p>
                    <ul className={`${styles.listStyleNone} ${styles.footerIcons}`}>
                        {iconItems.map(({ title, name, url, newTab, iconName }) => (
                            <li className={styles.footerIcons} key={`${title}_${name}`}>
                                <a
                                    href={urlWithBaseUrl(url)}
                                    {...(newTab ? { target: '_blank', rel: 'noreferrer' } : {})}
                                >
                                    {iconName && <Icon name={iconName} />}
                                </a>
                            </li>
                        ))}
                    </ul>
                    <div className={styles.placeholderSquares}>
                        <div className={styles.square}></div>
                        <div className={styles.square}></div>
                        <div className={styles.square}></div>
                    </div>
                </div>
                <MenuColumns footerItems={footerItems} />
            </div>

            <div className={classNames(styles.legal, 'layout-grid')}>
                <p className="text-sm">AG Grid Ltd registered in the United Kingdom. Company&nbsp;No.&nbsp;07318192.</p>
            </div>

            {(path === SITE_BASE_URL || path === undefined) && (
                <div className={classNames(styles.trademarks, 'layout-grid')}>
                    <p className="text-sm">The Microsoft logo is a trademark of the Microsoft group of companies.</p>
                </div>
            )}
        </footer>
    );
};
