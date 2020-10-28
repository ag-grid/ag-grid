import React from 'react';
import { Link } from 'gatsby';
import { GlobalContextProvider } from '../components/GlobalContext';
import FrameworkSelector from '../components/FrameworkSelector';
import Menu from '../components/Menu';
import { getPageName } from '../utils/get-page-name';
import styles from './index.module.scss';
import './index.scss';

export const Layout = ({ path, children, pageContext: { framework, layout } }) => {
    if (layout === 'bare') {
        return children;
    }

    const pageName = getPageName(path);

    return <GlobalContextProvider>
        <div className={styles.mainContainer}>
            <div className={styles.header}>
                <Link to="/" className={styles.header__logo} />
                <FrameworkSelector path={path} currentFramework={framework} />
            </div>
            <div className={styles.contentViewport}>
                {framework && <div className={styles.mainMenu}>
                    <Menu currentFramework={framework} currentPage={pageName} />
                </div>}
                <div className={styles.content}>
                    {children}
                </div>
            </div>
            <div className={styles.footer}>
                &copy; AG-Grid Ltd 2020
            </div>
        </div>
    </GlobalContextProvider>;
};

export default Layout;