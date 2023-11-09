import classnames from 'classnames';
import { withPrefix } from 'gatsby';
import React, { useState } from 'react';
import breakpoints from '../../design-system/breakpoint.module.scss';
import LogoType from '../../images/inline-svgs/ag-grid-logotype.svg';
import MenuIcon from '../../images/inline-svgs/menu-icon.svg';
import { useWindowSize } from '../../utils/use-window-size';
import { Collapsible } from '../Collapsible';
import { Icon } from '../Icon';
import LogoMark from '../LogoMark';
import { DarkModeToggle } from './DarkModeToggle';
import styles from './SiteHeader.module.scss';
import menuData from '../../../doc-pages/licensing/menu.json';
import apiMenuData from '../../../doc-pages/licensing/api-menu.json';
import Search from "../search/Search";

const SITE_HEADER_SMALL_WIDTH = parseInt(breakpoints['site-header-small'], 10);

const links = [
    {
        name: 'Demo',
        url: '/example/',
        docsLink: false,
    },
    {
        name: 'Docs',
        url: withPrefix('/documentation/'),
        docsLink: true,
    },
    {
        name: 'API',
        url: withPrefix('/api/'),
        docsLink: true,
    },
    {
        name: 'Blog',
        url: 'https://blog.ag-grid.com/',
        docsLink: false,
    },
    {
        name: 'Pricing',
        url: '/license-pricing',
        docsLink: false,
    },
    {
        name: 'Github',
        url: 'https://github.com/ag-grid/ag-grid',
        icon: <Icon name="github" />,
        cssClass: 'github-item',
        docsLink: false,
    },
];

const isLinkSelected = (name, path) => {
    const link = links.find(l => l.name === name);
    if (!link) return false;

    if (!link.docsLink) {
        return link.url.startsWith('http') ? path === link.url : path.startsWith(link.url);
    }

    const checkItemsRecursive = items => items.some(item =>
        item.url && path.endsWith(item.url) || (item.items && checkItemsRecursive(item.items))
    );

    const menuToCheck = link.docsLink ? (name === "API" ? apiMenuData : menuData) : [];
    const whatsNewLink = name === "Docs" ? menuToCheck.find(item => item.title === "What's New") : null;

    return checkItemsRecursive(menuToCheck) || (whatsNewLink && path.endsWith(whatsNewLink.url));
};

const HeaderLinks = ({ path, isOpen, toggleIsOpen }) => {
    return links.map((link) => {
        const linkClasses = classnames(styles.navItem, {
            [styles.navItemActive]: isLinkSelected(link.name, path),
            [styles[link.cssClass]]: link.cssClass,
        });

        return (
            <li key={link.name.toLocaleLowerCase()} className={linkClasses}>
                <a
                    className={styles.navLink}
                    href={link.url}
                    onClick={() => {
                        if (isOpen) {
                            toggleIsOpen();
                        }
                    }}
                    aria-label={`AG Grid ${link.name}`}
                >
                    {link.icon}
                    <span>{link.name}</span>
                </a>
            </li>
        );
    });
};

const HeaderExpandButton = ({ isOpen, toggleIsOpen }) => (
    <button
        className={styles.mobileMenuButton}
        type="button"
        aria-controls={styles.mainNav}
        aria-expanded={isOpen.toString()}
        aria-label="Toggle navigation"
        onClick={() => toggleIsOpen && toggleIsOpen()}
    >
        <MenuIcon className={styles.menuIcon} />
    </button>
);

const HeaderNav = ({ path, currentFramework }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { width } = useWindowSize();
    const isDesktop = width >= SITE_HEADER_SMALL_WIDTH;
    const isDocsUrl = path.includes('-data-grid');

    const toggleIsOpen = () => {
        setIsOpen((currentIsOpen) => {
            return !currentIsOpen;
        });
    };

    return (
        <>
            <HeaderExpandButton isOpen={isOpen} toggleIsOpen={toggleIsOpen} />

            {isDocsUrl ? <Search currentFramework={currentFramework} /> : null}
            <Collapsible id="main-nav" isDisabled={isDesktop} isOpen={isOpen}>
                <nav id={isDesktop ? 'main-nav' : undefined} className={styles.mainNav}>
                    <ul className={classnames(styles.navItemList, 'list-style-none')}>
                        <HeaderLinks path={path} isOpen={isOpen} toggleIsOpen={toggleIsOpen} />
                        <DarkModeToggle />
                    </ul>
                </nav>
            </Collapsible>
        </>
    );
};

export const SiteHeader = ({ path, currentFramework }) => {
    const [isLogoHover, setIsLogoHover] = useState(false);
    return (
        <header className={styles.header}>
            <div className={classnames(styles.headerInner, 'page-margin')}>
                <a
                    href="/"
                    aria-label="Home"
                    className={styles.headerLogo}
                    onMouseEnter={() => {
                        setIsLogoHover(true);
                    }}
                    onMouseLeave={() => {
                        setIsLogoHover(false);
                    }}
                >
                    <LogoType />
                    <LogoMark bounce={isLogoHover} />
                </a>

                <HeaderNav path={path} currentFramework={currentFramework} />
            </div>
        </header>
    );
};
