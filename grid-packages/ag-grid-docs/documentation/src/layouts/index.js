import Footer from 'components/footer/Footer';
import FrameworkSelector from 'components/FrameworkSelector';
import { GlobalContextProvider } from 'components/GlobalContext';
import Menu from 'components/Menu';
import Search from 'components/search/Search';
import { SiteHeader } from 'components/site-header/SiteHeader';
import React from 'react';
import { Helmet } from 'react-helmet';
import supportedFrameworks from 'utils/supported-frameworks';
import favIcons from '../images/favicons';
import styles from './index.module.scss';
import './mailchimp.css';

const FULL_SCREEN_PAGES = ['example'];

const FULL_SCREEN_WITH_FOOTER_PAGES = [
    'license-pricing',
    'about',
    'cookies',
    'changelog',
    'pipeline',
    'privacy',
    'style-guide',
];

const getAllPageUrls = (pages) => {
    return pages.map((page) => `/${page}`).concat(pages.map((page) => `/${page}/`));
};

const TopBar = ({ frameworks, currentFramework, path }) => {
    const frameworksData = supportedFrameworks
        .filter((f) => !frameworks || frameworks.includes(f))
        .map((framework) => ({
            name: framework,
            url: path.replace(`/${currentFramework}-`, `/${framework}-`),
        }));

    return (
        <div className={styles['top-bar']}>
            <div className={styles['top-bar__wrapper']}>
                <div className={styles['top-bar__search']}>
                    <button
                        className={styles['top-bar__nav-button']}
                        type="button"
                        data-toggle="collapse"
                        data-target="#side-nav"
                        aria-controls="side-nav"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className={styles['top-bar__nav-button-icon']}></span>
                    </button>

                    <Search currentFramework={currentFramework} />
                </div>

                {currentFramework && (
                    <div className={styles['top-bar__framework-selector']}>
                        <FrameworkSelector
                            data={frameworksData}
                            currentFramework={currentFramework}
                            showSelectedFramework
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * This controls the layout template for all pages.
 */
export const Layout = ({
    children,
    pageContext: { frameworks, framework = 'javascript', layout, pageName },
    location: { pathname: path },
}) => {
    if (layout === 'bare') {
        // only for on the fly example runner
        return children;
    }

    // takes account of current archives as well as new testing/archives
    const processedPath = path.replace(/.*archive\/[0-9]{1,2}.[0-9].[0-9]/, '')
        .replace(/.*(testing|archives).ag-grid.com/, '');

    const fullScreenPage = processedPath === '/' || getAllPageUrls(FULL_SCREEN_PAGES).includes(processedPath);

    const fullScreenWithFooter = getAllPageUrls(FULL_SCREEN_WITH_FOOTER_PAGES).includes(processedPath);

    return (
        <GlobalContextProvider>
            <Helmet>
                {getFavicons()}
                {getAppleTouchIcons()}
            </Helmet>
            <div className={styles['main-container']}>
                <Helmet htmlAttributes={{ lang: 'en' }} />
                <SiteHeader path={path} />

                {!fullScreenPage && !fullScreenWithFooter && (
                    <TopBar frameworks={frameworks} currentFramework={framework} path={path} />
                )}
                <div className={styles['content-viewport']}>
                    {!fullScreenPage && !fullScreenWithFooter && (
                        <aside className={`${styles['main-menu']}`}>
                            <Menu currentFramework={framework} currentPage={pageName} />
                        </aside>
                    )}
                    <main is="div" className={styles['content']}>
                        {children}
                    </main>
                </div>
            </div>
            {(!fullScreenPage || fullScreenWithFooter) && <Footer framework={framework} />}
        </GlobalContextProvider>
    );
};

const getFavicons = () =>
    [196, 192, 180, 167, 152, 128, 32].map((size) => (
        <link key={size} rel="icon" type="image/png" sizes={`${size}x${size}`} href={favIcons[`favIcon${size}`]} />
    ));

const getAppleTouchIcons = () =>
    [180, 167, 152].map((size) => (
        <link key={size} rel="apple-touch-icon" sizes={`${size}x${size}`} href={favIcons[`favIcon${size}Touch`]} />
    ));

export default Layout;
