import React from 'react';
import { Link, navigate } from 'gatsby';
import { GlobalContextProvider } from '../components/GlobalContext';
import FrameworkSelector from '../components/FrameworkSelector';
import Menu from '../components/Menu';
import { getPageName } from '../utils/get-page-name';
import styles from './index.module.scss';

export const Layout = ({ path, children, pageContext: { frameworks, framework, layout } }) => {
    if (path === '/')  {
        navigate('/javascript/', { replace: true});
        return null;
    }

    if (layout === 'bare') {
        return children;
    }

    const pageName = getPageName(path);

    return <GlobalContextProvider>
        <div className={styles['main-container']}>
            <div className={styles['header']}>
                <Link to="/" className={styles['header__logo']} />
                <FrameworkSelector frameworks={frameworks} path={path} currentFramework={framework} />
            </div>
            <div className={styles['content-viewport']}>
                {framework && <div className={styles['main-menu']}>
                    <Menu currentFramework={framework} currentPage={pageName} />
                </div>}
                <div className={styles['content']}>
                    {children}
                </div>
            </div>
            <div className={styles['footer']}>
                &copy; AG-Grid Ltd { new Date().getFullYear().toString() }
            </div>
        </div>
    </GlobalContextProvider>;
};

export default Layout;