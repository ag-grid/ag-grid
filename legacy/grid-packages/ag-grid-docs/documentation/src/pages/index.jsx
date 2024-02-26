import classNames from 'classnames';
import React, { useEffect, useMemo } from 'react';
import { createAutomatedExampleManager } from '../components/automated-examples/lib/createAutomatedExampleManager';
import Footer from '../components/footer/Footer';
import FrameworkSelector from '../components/FrameworkSelector';
import { Quotes } from '../components/quotes/Quotes';
import { quotesData } from '../components/quotes/quotesData';
import { agGridVersion } from '../utils/consts';
import Seo from './components/SEO';
// @ts-ignore
import styles from '@design-system/modules/GridHomepage.module.scss';
import LogoMark from '../components/LogoMark';
import ChartsLogo from '../images/inline-svgs/ag-charts-logo.svg';

const IS_SSR = typeof window === 'undefined';

const AutomatedIntegratedCharts = React.lazy(() => import('./components/home-page-demos/AutomatedIntegratedCharts'));
const AutomatedRowGrouping = React.lazy(() => import('./components/home-page-demos/AutomatedRowGrouping'));
const HeroGrid = React.lazy(() => import('./components/home-page-demos/HeroGrid'));

const Default = () => {
    const automatedExampleManager = useMemo(
        () =>
            createAutomatedExampleManager({
                debugCanvasClassname: styles.automatedExampleDebugCanvas,
                debugPanelClassname: styles.automatedExampleDebugPanel,
            }),
        []
    );
    const frameworksData = [
        {
            name: 'react',
            url: '/react-data-grid/',
        },
        {
            name: 'angular',
            url: '/angular-data-grid/',
        },
        {
            name: 'vue',
            url: '/vue-data-grid/',
        },
        {
            name: 'javascript',
            url: '/javascript-data-grid/',
        },
    ];
    let debugValue, debugLogLevel, isCI, runAutomatedExamplesOnce;

    if (!IS_SSR) {
        const searchParams = new URLSearchParams(window.location.search);
        debugValue = searchParams.get('debug');
        debugLogLevel = searchParams.get('debugLogLevel');
        isCI = searchParams.get('isCI') === 'true';
        runAutomatedExamplesOnce = searchParams.get('runOnce') === 'true';
    }

    useEffect(() => {
        automatedExampleManager.setDebugEnabled(Boolean(debugValue));
        automatedExampleManager.setDebugLogLevel(debugLogLevel);
        automatedExampleManager.setDebugInitialDraw(debugValue === 'draw');
    }, []);

    return (
        <>
            <Seo
                title="AG Grid: High-Performance React Grid, Angular Grid, JavaScript Grid"
                description={`AG Grid is a feature rich datagrid designed for the major JavaScript Frameworks. Version ${agGridVersion} is out now. Easily integrate into your application to deliver filtering, grouping, aggregation, pivoting and much more with the performance that your users expect. Our Community version is free and open source, or take a 2 month trial of AG Grid Enterprise.`}
            />
            <div className={styles.homepageHero}>
                <section className={classNames(styles.heroInner, 'layout-max-width-small')}>
                    <section className={styles.heroHeadings}>
                        <h1 className="text-xl">The&nbsp;Best&nbsp;JavaScript Grid&nbsp;in&nbsp;the&nbsp;World</h1>
                        <h2 className="text-base normal-weight-text">
                            The professional choice for developers building enterprise&nbsp;applications
                        </h2>
                    </section>

                    <section className={styles.heroGrid}>
                        {IS_SSR && (
                            <div className={styles.loadingLogoContainer}>
                                <LogoMark isSpinning />
                            </div>
                        )}
                        {!IS_SSR && (
                            <React.Suspense fallback={<></>}>
                                <HeroGrid />
                            </React.Suspense>
                        )}
                    </section>
                </section>
            </div>

            <div className={styles.homepageFrameworks}>
                <div className={classNames(styles.frameworksInner, 'layout-max-width-small')}>
                    <span className={classNames(styles.frameworksLabel, 'text-secondary')}>Get&nbsp;started</span>

                    <FrameworkSelector data={frameworksData} isFullWidth />
                </div>
            </div>

            <div className={styles.homepageCustomers}>
                <div className={classNames(styles.customersInner, 'layout-max-width-small')}>
                    <h2>Used by 90% of the Fortune 500</h2>
                    <p className="text-tertiary">
                        Trusted by the finest teams globally, an unmatched experience for developers and users alike.
                    </p>
                    <div className={styles.customerLogos}></div>
                </div>
            </div>

            <div className={styles.homepageQuotes}>
                <div className="layout-max-width-small">
                    <Quotes data={quotesData} />
                </div>
            </div>
            
            <div className={styles.homepageCharts}>
                <div className={classNames(styles.chartsInner, 'layout-max-width-small')}>
                    <div className={styles.chartsCopy}>
                        <ChartsLogo className={styles.chartsLogo} />
                        <p className="text-lg">
                            Check out the all new{' '}
                            <a href="https://charts.ag-grid.com">
                                <b>AG Charts</b>
                            </a>
                            . Experience the power of <b>AG Grid</b>{' '}
                            <a href="/javascript-data-grid/integrated-charts/">Integrated Charts</a> in a standalone
                            library.
                        </p>
                    </div>
                    <div className={styles.chartsExample}>
                        <img
                            className={styles.chartsExampleLight}
                            src="images/ag-charts-gallery-light.webp"
                            alt="AG Charts"
                        />
                        <img
                            className={styles.chartsExampleDark}
                            src="images/ag-charts-gallery-dark.webp"
                            alt="AG Charts"
                        />
                    </div>
                </div>
            </div>

            <section className={styles.automatedRowGroupingOuter}>
                <div className={classNames('layout-max-width-small', styles.homepageExample)}>
                    <div className={styles.automatedRowGrouping}>
                        {!IS_SSR && (
                            <React.Suspense fallback={<></>}>
                                <AutomatedRowGrouping
                                    automatedExampleManager={automatedExampleManager}
                                    useStaticData={isCI}
                                    runOnce={runAutomatedExamplesOnce}
                                    visibilityThreshold={0.2}
                                    // Always keep it in dark mode
                                    darkMode={true}
                                />
                            </React.Suspense>
                        )}
                    </div>
                </div>
            </section>

            <section className={styles.automatedIntegratedChartsOuter}>
                <div className={classNames('layout-max-width-small', styles.homepageExample)}>
                    <div className={styles.automatedIntegratedCharts}>
                        {!IS_SSR && (
                            <React.Suspense fallback={<></>}>
                                <AutomatedIntegratedCharts
                                    automatedExampleManager={automatedExampleManager}
                                    useStaticData={isCI}
                                    runOnce={runAutomatedExamplesOnce}
                                    visibilityThreshold={0.8}
                                />
                            </React.Suspense>
                        )}
                    </div>
                </div>
            </section>

            <div className={styles.homepageSponsorship}>
                <section className={classNames(styles.sponsorshipInner, 'layout-max-width-small')}>
                    <div>
                        <h2>Supporting Open&nbsp;Source</h2>
                        <h3 className="thin-text">We are proud to sponsor the tools we use and love.</h3>
                    </div>

                    <ul className={classNames(styles.projectsList, 'list-style-none')}>
                        <li className={styles.project}>
                            <img src="images/fw-logos/webpack.svg" alt="Webpack" />

                            <h3>Webpack</h3>
                        </li>

                        <li className={classNames(styles.project, styles.projectPlunker)}>
                            <img src="images/fw-logos/plunker.svg" alt="Plunker" />

                            <h3>Plunker</h3>
                        </li>
                    </ul>
                </section>
            </div>

            <Footer />
        </>
    );
};

export default Default;
