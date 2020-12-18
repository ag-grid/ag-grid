import React from 'react';
import { GlobalContextProvider } from '../components/GlobalContext';
import HeaderNav from '../components/HeaderNav';
import Menu from '../components/Menu';
import Footer from '../components/footer/Footer';
import Search from '../components/search/Search';
import FrameworkSelector from '../components/FrameworkSelector';
import { getPageName } from '../utils/get-page-name';
import styles from './index.module.scss';

const TopBar = ({ frameworks, framework, path }) => (
    <div className={styles['top-bar']}>
        <div className={styles['top-bar__wrapper']}>
            <div className={styles['top-bar__search']}>
                <button
                    className={styles['top-bar__nav-button']}
                    type="button" data-toggle="collapse"
                    data-target="#side-nav"
                    aria-controls="side-nav"
                    aria-expanded="false"
                    aria-label="Toggle navigation">
                    <span className={styles['top-bar__nav-button-icon']}></span>
                </button>
                <Search indices={[{ name: `ag-grid_${framework}`, title: "Documentation Pages" }]} />
            </div>
            <div className={styles['top-bar__framework-selector']}>
                <FrameworkSelector frameworks={frameworks} path={path} currentFramework={framework} />
            </div>
        </div>
    </div>
);

export const Layout = ({ path, children, pageContext: { frameworks, framework = 'javascript', layout } }) => {
    if (layout === 'bare') {
        return children;
    }

    const pageName = getPageName(path);

    return <GlobalContextProvider>
        <div className={styles['main-container']}>
            <header className={styles.header}>
                <div className={styles.header__wrapper}>
                    {/* eslint-disable-next-line jsx-a11y/anchor-has-content */}
                    <a href="/" aria-label="Home" className={styles['header__logo']}></a>
                    <HeaderNav />
                </div>
            </header>
            <TopBar frameworks={frameworks} framework={framework} path={path} />
            <div className={styles['content-viewport']}>
                <aside className={`${styles['main-menu']}`}>
                    <Menu currentFramework={framework} currentPage={pageName} />
                </aside>
                <main is="div" className={styles['content']}>
                    {children}
                </main>
            </div>
        </div>
        <Footer />
    </GlobalContextProvider>;
};

export default Layout;