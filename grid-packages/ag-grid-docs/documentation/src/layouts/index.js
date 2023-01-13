import React, { useState } from 'react';
import {Helmet} from 'react-helmet';
import {GlobalContextProvider} from 'components/GlobalContext';
import HeaderNav from 'components/HeaderNav';
import Menu from 'components/Menu';
import Footer from 'components/footer/Footer';
import Search from 'components/search/Search';
import supportedFrameworks from 'utils/supported-frameworks';
import FrameworkSelector from 'components/FrameworkSelector';
import favIcons from '../images/favicons';
import LogoType from '../images/inline-svgs/ag-grid-logotype.svg';
import LogoMark from 'components/LogoMark';
import styles from './index.module.scss';
import './mailchimp.css';

const TopBar = ({ frameworks, currentFramework, path }) => {
    const data = supportedFrameworks
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
                        <span className={styles['top-bar__framework-label']}>Framework:</span>
                        <FrameworkSelector data={data} currentFramework={currentFramework} showSelectedFramework />
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * This controls the layout template for all pages.
 */
export const Layout = ({children, pageContext: {frameworks, framework = 'javascript', layout, pageName}, location: {pathname: path}, data}) => {
    if (layout === 'bare') { // only for on the fly example runner
        return children;
    }

    // takes account of archives too
    const processedPath = path.replace(/.*archive\/[0-9]{1,2}.[0-9].[0-9]/,'');

    const fullScreenPage = processedPath === '/' ||
        processedPath === '/example' || processedPath === '/example/';

    const fullScreenWithFooter = processedPath === '/license-pricing' || processedPath === '/license-pricing/' ||
        processedPath === '/about' || processedPath === '/about/' ||
        processedPath === '/cookies' || processedPath === '/cookies/' ||
        processedPath === '/changelog' || processedPath === '/changelog/' ||
        processedPath === '/pipeline' || processedPath === '/pipeline/' ||
        processedPath === '/privacy' || processedPath === '/privacy/';

    const [isLogoHover, setIsLogoHover]  = useState(false);


    return <GlobalContextProvider>
        <Helmet>
            {getFavicons()}
            {getAppleTouchIcons()}
        </Helmet>
        <div className={styles['main-container']}>
            <Helmet htmlAttributes={{lang: 'en'}}/>
            <header className={styles.header}>
                <div className={styles.header__wrapper}>
                    <a
                        href="/"
                        aria-label="Home"
                        className={styles['header__logo']}
                        onMouseEnter={() => {
                            setIsLogoHover(true);
                        }}
                        onMouseLeave={() => {
                            setIsLogoHover(false);
                        }}
                    >
                        <LogoType />
                        <LogoMark bounce={isLogoHover} />
                    </a>

                    <HeaderNav path={path}/>
                </div>
            </header>
            {(!fullScreenPage && !fullScreenWithFooter) && <TopBar frameworks={frameworks} currentFramework={framework} path={path}/>}
            <div className={styles['content-viewport']}>
                {(!fullScreenPage && !fullScreenWithFooter) &&
                    <aside className={`${styles['main-menu']}`}>
                        <Menu currentFramework={framework} currentPage={pageName}/>
                    </aside>}
                <main is="div" className={styles['content']}>
                    {children}
                </main>
            </div>
        </div>
        {(!fullScreenPage || fullScreenWithFooter) && <Footer framework={framework}/>}
    </GlobalContextProvider>;
};

const getFavicons = () =>
    [196, 192, 180, 167, 152, 128, 32].map(size => <link key={size} rel="icon" type="image/png" sizes={`${size}x${size}`}
                                                         href={favIcons[`favIcon${size}`]}/>);

const getAppleTouchIcons = () =>
    [180, 167, 152].map(size => <link key={size} rel="apple-touch-icon" sizes={`${size}x${size}`} href={favIcons[`favIcon${size}Touch`]}/>);

export default Layout;
