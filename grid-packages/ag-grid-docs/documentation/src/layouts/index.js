import React from 'react';
import { Link, navigate } from 'gatsby';
import { GlobalContextProvider } from '../components/GlobalContext';
import FrameworkSelector from '../components/FrameworkSelector';
import HeaderNav from '../components/HeaderNav';
import Menu from '../components/Menu';
import Footer from '../components/footer/Footer';
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
                <HeaderNav />
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
            <Footer framework={ framework } />
        </div>
    </GlobalContextProvider>;
};

export default Layout;