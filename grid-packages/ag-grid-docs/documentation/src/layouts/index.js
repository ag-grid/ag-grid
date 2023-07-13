import classnames from 'classnames';
import Footer from 'components/footer/Footer';
import { GlobalContextProvider } from 'components/GlobalContext';
import Menu from 'components/Menu';
import { SiteHeader } from 'components/site-header/SiteHeader';
import { TopBar } from 'components/TopBar';
import React from 'react';
import { Helmet } from 'react-helmet';
import '../design-system/design-system.scss';
import favIcons from '../images/favicons';
import styles from './index.module.scss';

/**
 * This controls the layout template for all pages.
 */
export const Layout = ({
    children,
    pageContext: { frameworks, framework = 'javascript', layout, pageName, colorMode },
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
            <div className={styles.mainContainer}>
                <Helmet htmlAttributes={{ lang: 'en' }} />

                <SiteHeader path={path} />

                {!fullScreen && <TopBar frameworks={frameworks} currentFramework={framework} path={path} />}

                <div className={classnames(styles.contentContainer, !fullScreen && styles.fullScreenPage)}>
                    <div className={styles.contentViewport}>
                        {!fullScreen && <Menu currentFramework={framework} currentPage={pageName} path={path} />}

                        <main is="div">{children}</main>
                    </div>
                </div>
            </div>
            {(fullScreenWithFooter || !fullScreen) && <Footer framework={framework} path={path} />}
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
