import Footer from 'components/footer/Footer';
import { GlobalContextProvider } from 'components/GlobalContext';
import Menu from 'components/Menu';
import { SiteHeader } from 'components/site-header/SiteHeader';
import { TopBar } from 'components/TopBar';
import React from 'react';
import { Helmet } from 'react-helmet';
import favIcons from '../images/favicons';
import styles from './index.module.scss';
import './mailchimp.css';

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
    // spl todo: refactor next week!
    // set in gatsby-node.js
    let fullScreenPage = false,
        fullScreenWithFooter = false;
    if (layout === 'bare') {
        // only for on the fly example runner
        return children;
    } else if (layout === 'fullScreenPage') {
        fullScreenPage = true;
    } else if (layout === 'fullScreenPageWithFooter') {
        fullScreenWithFooter = true;
    }

    const fullScreen = fullScreenPage || fullScreenWithFooter;

    return (
        <GlobalContextProvider>
            <Helmet>
                {getFavicons()}
                {getAppleTouchIcons()}
            </Helmet>
            <div className={styles['main-container']}>
                <Helmet htmlAttributes={{ lang: 'en' }} />
                <SiteHeader path={path} />

                {!fullScreen && <TopBar frameworks={frameworks} currentFramework={framework} path={path} />}
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
            {(fullScreenWithFooter || !fullScreen) && <Footer framework={framework} />}
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
