import React, { useState } from 'react';
import { withPrefix } from 'gatsby';
import classnames from 'classnames';
import styles from './HeaderNav.module.scss';

const links = [
    {
        name: 'Demo',
        url: '/example'
    },
    {
        name: 'Documentation',
        url: withPrefix('/documentation/')
    },
    {
        name: 'Pricing',
        url: '/license-pricing'
    },
    {
        name: 'Blog',
        url: 'https://blog.ag-grid.com/?_ga=2.240961155.106872681.1607518091-965402545.1605286673'
    }
];

const HeaderLinks = ({path} ) => {
    const [active, setActive] = useState('Documentation')

    return (
        <ul className={styles['header-nav__navbar']}>
            {links.map(link => {
                const linkClasses = classnames(
                    styles['header-nav__link'],
                    {
                        [styles['header-nav__link--active']]: link.name === active && path !== '/'
                    });

                return (
                    <li key={link.name.toLocaleLowerCase()} className={linkClasses}>
                        <a className={styles['header-nav__link-anchor']} href={link.url} onClick={() => setActive(link.name)}>{link.name}</a>
                    </li>
                );
            })}
        </ul>
    );
}

const HeaderExpandButton = () => (
    <button
        className={styles['header-nav__button']}
        type="button" data-toggle="collapse"
        data-target="#main-nav"
        aria-controls="main-nav"
        aria-expanded="false"
        aria-label="Toggle navigation">
        <span className={styles['header-nav__button-icon']}></span>
    </button>
);

const HeaderNav = ({path}) => (
    <nav className={styles['header-nav']}>
        <div className={styles['header-nav__wrapper']}>
            <div className={styles['header-nav__navbar-collapse']} id="main-nav">
                <HeaderLinks path={path}/>
            </div>
            <div className={styles['header-nav__widgets']}>
                <HeaderExpandButton />
            </div>
        </div>
    </nav>
);

export default HeaderNav;
