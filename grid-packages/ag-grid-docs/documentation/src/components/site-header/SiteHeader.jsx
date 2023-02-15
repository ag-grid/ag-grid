import classnames from 'classnames';
import { withPrefix } from 'gatsby';
import React, { useRef, useState } from 'react';
import supportedFrameworks from 'utils/supported-frameworks.js';
import LogoType from '../../images/inline-svgs/ag-grid-logotype.svg';
import GithubLogo from '../../images/inline-svgs/github-logo.svg';
import MenuIcon from '../../images/inline-svgs/menu-icon.svg';
import LogoMark from '../LogoMark';
import styles from './SiteHeader.module.scss';

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

const getCurrentPageName = (path) => {
    const rawPath = path.split('/')[1];

    const allLinks = [
        ...links,
        ...supportedFrameworks.map((framework) => ({ name: 'Documentation', url: `/${framework}-data-grid` })),
    ];

    const match = allLinks.filter((link) => link.url.includes(rawPath));

    if (match && match.length === 1) {
        return match[0].name;
    }
};

const HeaderLinks = ({ path, toggleButtonRef }) => {
    return (
        <ul className={classnames(styles.navItemList, 'list-style-none')}>
            {links.map((link) => {
                const linkClasses = classnames(styles.navItem, {
                    [styles.navItemActive]: link.name === getCurrentPageName(path),
                    [styles[link.cssClass]]: link.cssClass,
                });

                return (
                    <li key={link.name.toLocaleLowerCase()} className={linkClasses}>
                        <a
                            className={styles.navLink}
                            href={link.url}
                            onClick={() => {
                                const isOpen = !toggleButtonRef.current?.classList.contains('collapsed');
                                if (isOpen) {
                                    toggleButtonRef.current?.click();
                                }
                            }}
                        >
                            {link.icon}
                            <span>{link.name}</span>
                        </a>
                    </li>
                );
            })}
        </ul>
    );
};

const HeaderExpandButton = ({ buttonRef }) => (
    <button
        ref={buttonRef}
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

const HeaderNav = ({ path }) => {
    const buttonRef = useRef();
    return (
        <>
            <HeaderExpandButton buttonRef={buttonRef} />
            <nav className={classnames(styles.nav, 'collapse')} id="main-nav">
                <HeaderLinks path={path} toggleButtonRef={buttonRef} />
            </nav>
        </>
    );
};

export const SiteHeader = ({ path }) => {
    const [isLogoHover, setIsLogoHover] = useState(false);
    return (
        <header className={classnames('ag-styles', styles.header)}>
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

                <HeaderNav path={path} />
            </div>
        </header>
    );
};
