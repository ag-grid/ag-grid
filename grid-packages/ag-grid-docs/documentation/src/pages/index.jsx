import classNames from 'classnames';
import React, { useEffect } from 'react';
import { createScriptDebuggerManager } from '../components/automated-examples/lib/scriptDebugger';
import Footer from '../components/footer/Footer';
import FrameworkSelector from '../components/FrameworkSelector';
import { Quotes } from '../components/quotes/Quotes';
import { quotesData } from '../components/quotes/quotesData';
import { agGridVersion } from '../utils/consts';
// @ts-ignore
import styles from './components/assets/homepage/homepage.module.scss';
import Seo from './components/SEO';

const IS_SSR = typeof window === 'undefined';

const AutomatedIntegratedCharts = React.lazy(() => import('./components/home-page-demos/AutomatedIntegratedCharts'));
const AutomatedRowGrouping = React.lazy(() => import('./components/home-page-demos/AutomatedRowGrouping'));
const HeroGrid = React.lazy(() => import('./components/home-page-demos/HeroGrid'));

const Default = () => {
    const frameworksData = [
        {
            name: 'javascript',
            url: '/javascript-data-grid/',
        },
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
            name: 'solid',
            url: '/react-data-grid/solidjs/',
        },
    ];
    let debugValue, isCI, runAutomatedExamplesOnce;

    if (!IS_SSR) {
        const searchParams = new URLSearchParams(window.location.search);
        debugValue = searchParams.get('debug');
        isCI = searchParams.get('isCI') === 'true';
        runAutomatedExamplesOnce = searchParams.get('runOnce') === 'true';
    }
    const scriptDebuggerManager = createScriptDebuggerManager({
        canvasClassname: styles.automatedExampleDebugCanvas,
        panelClassname: styles.automatedExampleDebugPanel,
    });

    useEffect(() => {
        scriptDebuggerManager.setEnabled(Boolean(debugValue));
        scriptDebuggerManager.setInitialDraw(debugValue === 'draw');
    }, []);

    return (
        <>
            <Seo
                title="AG Grid: High-Performance React Grid, Angular Grid, JavaScript Grid"
                description={`AG Grid is a feature rich datagrid designed for the major JavaScript Frameworks. Version ${agGridVersion} is out now. Easily integrate into your application to deliver filtering, grouping, aggregation, pivoting and much more with the performance that your users expect. Our Community version is free and open source, or take a 2 month trial of AG Grid Enterprise.`}
            />
            <div className="ag-styles">
                <div className={styles.homepageHero}>
                    <section className={classNames(styles.heroInner, 'page-margin')}>
                        <section className={styles.heroHeadings}>
                            <h1 className="font-size-extra-large">
                                The&nbsp;Best&nbsp;JavaScript Grid&nbsp;in&nbsp;the&nbsp;World
                            </h1>
                            <h2 className="font-size-medium normal-weight-text">
                                The professional choice for developers building enterprise&nbsp;applications
                            </h2>
                        </section>

                        <section className={styles.heroGrid}>
                            {!IS_SSR && (
                                <React.Suspense fallback={<></>}>
                                    <HeroGrid />
                                </React.Suspense>
                            )}
                        </section>
                    </section>
                </div>

                <div className={styles.homepageFrameworks}>
                    <div className={classNames(styles.frameworksInner, 'page-margin')}>
                        <span className={classNames(styles.frameworksLabel, 'text-secondary')}>Get&nbsp;started</span>

                        <FrameworkSelector data={frameworksData} isFullWidth />
                    </div>
                </div>

                <div className={styles.homepageQuotes}>
                    <div className="page-margin">
                        <Quotes data={quotesData} />
                    </div>
                </div>

                <section className="page-margin">
                    <div className={styles.automatedRowGrouping}>
                        {!IS_SSR && (
                            <React.Suspense fallback={<></>}>
                                <AutomatedRowGrouping
                                    scriptDebuggerManager={scriptDebuggerManager}
                                    useStaticData={isCI}
                                    runOnce={runAutomatedExamplesOnce}
                                />
                            </React.Suspense>
                        )}
                    </div>
                </section>

                <div className={styles.homepageDescription}>
                    <div className="page-margin">
                        <ul className="list-style-none">
                            <li>
                                <h3>Feature Packed</h3>
                                <p>
                                    The performance, feature set and quality of AG Grid has not been seen before in a
                                    JavaScript datagrid. Many features in AG Grid are unique to AG Grid, and simply put
                                    AG Grid into a class of its own, without compromising on quality or performance.
                                </p>
                            </li>
                            <li>
                                <h3>Industry Leading</h3>
                                <p>
                                    Over 1.2 million monthly downloads of AG Grid Community and over 80% of the Fortune
                                    500 using AG Grid Enterprise. AG Grid has become the JavaScript datagrid of choice
                                    for Enterprise JavaScript developers.
                                </p>
                            </li>
                            <li>
                                <h3>Community & Enterprise</h3>
                                <p>
                                    AG Grid Community is free and open-sourced under the MIT license. AG Grid Enterprise
                                    comes with dedicated support and more enterprise style features. AG Grid gives for
                                    free what other grids charge for, then provides AG Grid Enterprise where it goes
                                    above and beyond the competition.
                                </p>
                            </li>
                        </ul>
                    </div>
                </div>

                <section className={classNames('page-margin', styles.homepageExample)}>
                    <div className={styles.automatedIntegratedCharts}>
                        {!IS_SSR && (
                            <React.Suspense fallback={<></>}>
                                <AutomatedIntegratedCharts
                                    scriptDebuggerManager={scriptDebuggerManager}
                                    useStaticData={isCI}
                                    runOnce={runAutomatedExamplesOnce}
                                />
                            </React.Suspense>
                        )}
                    </div>
                </section>

                <div className={styles.homepageSponsorship}>
                    <section className={classNames(styles.sponsorshipInner, 'page-margin')}>
                        <div>
                            <h2>Supporting Open&nbsp;Source</h2>
                            <h3 className="thin-text">We are proud to sponsor the tools we use and love.</h3>
                        </div>

                        <ul className={classNames(styles.projectsList, 'list-style-none')}>
                            <li className={styles.project}>
                                <img src="images/fw-logos/webpack.svg" alt="Webpack" />

                                <h3>Webpack</h3>
                                <a href="https://medium.com/webpack/ag-grid-partners-with-webpack-24f8cf9d890b">
                                    Read about our Partnership with webpack.
                                </a>
                            </li>

                            <li className={styles.project}>
                                <img src="images/fw-logos/plunker.svg" alt="Plunker" />

                                <h3>Plunker</h3>
                                <a href="https://medium.com/ag-grid/plunker-is-now-backed-by-ag-grid-601c17440fca">
                                    Read about our Backing of Plunker.
                                </a>
                            </li>
                        </ul>
                    </section>
                </div>

                <Footer />
            </div>
        </>
    );
};

export default Default;
