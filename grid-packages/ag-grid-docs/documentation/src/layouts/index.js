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

// export const getScreenLayout = path => {
//     // order is important here
//     const processedPath = path.replace(/.*archive\/[0-9]{1,2}.[0-9].[0-9]/, "") // legacy archives
//         .replace(/.*(testing|archives).ag-grid.com\/AG-[0-9][0-9][0-9][0-9]/, "") // branch builds/new archives
//         .replace(/.*ag-grid.com/, "") // prod
//         .replace(/.*localhost:8000/, "") // localhost
//         .replace(/\?.*/, ""); // query params
//
//     const fullScreenPage = isFullScreenPage(processedPath);
//     const fullScreenWithFooter = isFullScreenPageWithFooter(processedPath);
//     return {fullScreenPage, fullScreenWithFooter};
// }

/**
 * This controls the layout template for all pages.
 */
export const Layout = ({
    children,
    pageContext: { frameworks, framework = 'javascript', layout, pageName },
    location: { pathname: path, href },
}) => {
    let fullScreenPage = false, fullScreenWithFooter = false;
    if (layout === 'bare') {
        // only for on the fly example runner
        return children;
    } else if(layout === 'fullScreenPage') {
        fullScreenPage = true;
    } else if(layout === 'fullScreenPageWithFooter') {
        fullScreenWithFooter = true;
    }

    const fullScreen = (fullScreenPage || fullScreenWithFooter);

    return (
        <GlobalContextProvider>
            <Helmet>
                {getFavicons()}
                {getAppleTouchIcons()}
            </Helmet>
            <div className={styles['main-container']}>
                <Helmet htmlAttributes={{ lang: 'en' }} />
                <SiteHeader path={path} />

                {!fullScreen && (
                    <TopBar frameworks={frameworks} currentFramework={framework} path={path} />
                )}
                <div className={styles['content-viewport']}>
                    {!fullScreen && (
                        <aside className={`${styles['main-menu']}`}>
                            <Menu currentFramework={framework} currentPage={pageName} />
                        </aside>
                    )}
                    <main is="div" className={styles['content']}>
                        {children}
                    </main>
                </div>
            </div>
            {fullScreenWithFooter && <Footer framework={framework} />}
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
