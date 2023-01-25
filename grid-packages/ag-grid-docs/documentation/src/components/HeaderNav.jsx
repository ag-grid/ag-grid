import classnames from 'classnames';
import { withPrefix } from 'gatsby';
import React, { useState } from 'react';
import GithubLogo from '../images/inline-svgs/github-logo.svg';
import MenuIcon from '../images/inline-svgs/menu-icon.svg';
import styles from './HeaderNav.module.scss';

const links = [
    {
        name: 'Demo',
        url: '/example',
    },
    {
        name: 'Documentation',
        url: withPrefix('/documentation/'),
    },
    {
        name: 'Pricing',
        url: '/license-pricing',
    },
    {
        name: 'Blog',
        url: 'https://blog.ag-grid.com/',
    },
    {
        name: 'Github',
        url: 'https://github.com/ag-grid/ag-grid',
        icon: <GithubLogo />,
        cssClass: 'github-item',
    },
];

const getActiveLink = (path) => {
    const rawPath = path.replaceAll('/', '');
    const match = links.filter((link) => link.url.includes(rawPath));
    if (match && match.length === 1) {
        return match[0].name;
    }

    return 'Documentation';
};

const HeaderLinks = ({ path }) => {
    const [active, setActive] = useState(getActiveLink(path));

    return (
        <ul className={classnames(styles.navItemList, 'list-style-none')}>
            {links.map((link) => {
                const linkClasses = classnames(styles.navItem, {
                    [styles.navItemActive]: link.name === active && path !== '/',
                    [styles[link.cssClass]]: link.cssClass,
                });

                return (
                    <li key={link.name.toLocaleLowerCase()} className={linkClasses}>
                        <a className={styles.navLink} href={link.url} onClick={() => setActive(link.name)}>
                            {link.icon}
                            <span>{link.name}</span>
                        </a>
                    </li>
                );
            })}
        </ul>
    );
};

const HeaderExpandButton = () => (
    <button
        className={styles.mobileMenuButton}
        type="button"
        data-toggle="collapse"
        data-target="#main-nav"
        aria-controls="main-nav"
        aria-expanded="false"
        aria-label="Toggle navigation"
    >
        <MenuIcon className={styles.menuIcon} />
    </button>
);

const HeaderNav = ({ path }) => (
    <>
        <HeaderExpandButton />
        <nav className={classnames(styles.nav, 'collapse')} id="main-nav">
            <HeaderLinks path={path} />
        </nav>
    </>
);

export default HeaderNav;
