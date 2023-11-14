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
import menuData from '../../doc-pages/licensing/menu.json';
import apiMenuData from '../../doc-pages/licensing/api-menu.json';

/**
 * This controls the layout template for all pages.
 */
export const Layout = ({
    children,
    pageContext: { frameworks, framework = 'javascript', layout, pageName, darkMode },
    location: { pathname: path, href },
}) => {

    // prevent rendering Menu on documentation or API paths to prevent consistency
    const isDocumentationOrApiPath = ["/documentation/", "/api/"].includes(path);
    if (isDocumentationOrApiPath) {
        return null;
    }

    // define the layout effects
    const layoutEffects = {
        bare: () => children, // Function that returns children for 'bare' layout
        fullScreenPage: { fullScreenPage: true },
        fullScreenPageWithFooter: { fullScreenWithFooter: true },
        suppressFrameworkSelector: { suppressFrameworkSelector: true },
    };

    // apply the layout effect based on the current layout
    const effect = layoutEffects[layout];
    if (typeof effect === 'function') {
        return effect(); // If it's a function, invoke it
    }

    let fullScreenPage = false;
    let fullScreenWithFooter = false;
    let suppressFrameworkSelector = false;
    if (effect) {
        ({ fullScreenPage, fullScreenWithFooter, suppressFrameworkSelector } = effect);
    }

    // determine if the layout is full screen
    const fullScreen = fullScreenPage || fullScreenWithFooter;

    // select appropriate menu data based on the path (now that there are Documentation and API headers)
    const isApiMenu = isPathInApiMenu(path, apiMenuData);
    const selectedMenuData = isApiMenu ? apiMenuData : menuData;

    return (
        <GlobalContextProvider>
            <Helmet>
                {getFavicons()}
                {getAppleTouchIcons()}
            </Helmet>
            <div className={styles.mainContainer}>
                <Helmet htmlAttributes={{ lang: 'en' }} />

                <SiteHeader path={path} currentFramework={framework} />

                <div className={classnames(styles.contentContainer, !fullScreen && styles.fullScreenPage)}>
                    <div className={styles.contentViewport}>
                        {!fullScreen &&
                            <Menu currentFramework={framework}
                                  currentPage={pageName}
                                  path={path}
                                  menuData={selectedMenuData}
                                  expandAllGroups={isApiMenu}
                                  hideChevrons={isApiMenu}/>
                        }
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

const isPathInApiMenu = (path, menuData) =>
    menuData.some(group =>
        group.items.some(item =>
            item.items && item.items.some(subItem => path.endsWith(subItem.url))
        )
    );

export default Layout;
