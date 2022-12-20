import React from 'react';
// @ts-ignore
import styles from './components/assets/homepage/homepage.module.scss';
import Footer from '../components/footer/Footer';
import Seo from "./components/SEO";
import {agGridVersion} from "../utils/consts";
import {useDeviceWidth} from '../utils/use-device-width';

const IS_SSR = typeof window === "undefined"
const MOBILE_WIDTH = 640;

const BestHtmlDemo = React.lazy(() => import("./components/home-page-demos/BestHtmlGrid"));
const LiveStreamingDemo = React.lazy(() => import("./components/home-page-demos/LiveStreaming"));
const ChartingDashboardDemo = React.lazy(() => import("./components/home-page-demos/ChartingDashboard"));

const Default = () => {
    const deviceWidth = useDeviceWidth();
    const isMobile = deviceWidth < MOBILE_WIDTH;
    const showGrid = !IS_SSR && !isMobile;

    return (
        <>
            <Seo title="AG Grid: High-Performance React Grid, Angular Grid, JavaScript Grid"
                 description={`AG Grid is a feature rich datagrid designed for the major JavaScript Frameworks. Version ${agGridVersion} is out now. Easily integrate into your application to deliver filtering, grouping, aggregation, pivoting and much more with the performance that your users expect. Our Community version is free and open source, or take a 2 month trial of AG Grid Enterprise.`}/>
            <div className={styles['root-page-content']}>
                <div className={`${styles['stage-scenarios']} ${styles['main']}`}>
                    <h1 className={styles['heading-scenarios']}>The Best JavaScript Grid in the World</h1>
                    <section>
                        <div className={styles['demo']}>
                            {showGrid && <React.Suspense fallback={<div>Loading...</div>}>
                                <BestHtmlDemo/>
                            </React.Suspense>}
                        </div>
                        <img className={styles['mobile-demo-image']} src="./images/ag-grid-demo-image.webp" alt="AG Grid demo" width="400" height="196"/>
                    </section>
                </div>
                <div className={styles['stage-frameworks']}>
                    <section className={styles['stage-frameworks__section-frameworks']}>
                        <div>
                            <h2>Get Started</h2>
                        </div>
                        <div className={styles['stage-frameworks__section-frameworks__framework-boxes']}>
                            <div className={styles['stage-frameworks__section-frameworks__framework-boxes__framework-box']}>
                                <div className={styles['stage-frameworks__section-frameworks__box-shadow']}>
                                    <a href="/javascript-data-grid/" style={{textDecoration: "none"}}>
                                        <div className={styles['stage-frameworks__section-frameworks__box-contents']}>
                                            <img src="images/fw-logos/javascript.svg" alt="JavaScript"/>
                                            <div>
                                                <h3>JavaScript</h3>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            </div>
                            <div className={styles['stage-frameworks__section-frameworks__framework-boxes__framework-box']}>
                                <div className={styles['stage-frameworks__section-frameworks__box-shadow']}>
                                    <a href="/angular-data-grid/" style={{textDecoration: "none"}}>
                                        <div className={styles['stage-frameworks__section-frameworks__box-contents']}>
                                            <img src="images/fw-logos/angular.svg" alt="Angular"/>
                                            <div>
                                                <h3>Angular</h3>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            </div>
                            <div className={styles['stage-frameworks__section-frameworks__framework-boxes__framework-box']}>
                                <div className={styles['stage-frameworks__section-frameworks__box-shadow']}>
                                    <a href="/react-data-grid/" style={{textDecoration: "none"}}>
                                        <div className={styles['stage-frameworks__section-frameworks__box-contents']}>
                                            <img src="images/fw-logos/react.svg" alt="React"/>
                                            <div>
                                                <h3>React</h3>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            </div>
                            <div className={styles['stage-frameworks__section-frameworks__framework-boxes__framework-box']}>
                                <div className={styles['stage-frameworks__section-frameworks__box-shadow']}>
                                    <a href="/vue-data-grid/" style={{textDecoration: "none"}}>
                                        <div className={styles['stage-frameworks__section-frameworks__box-contents']}>
                                            <img src="images/fw-logos/vue.svg" alt="Vue"/>
                                            <div>
                                                <h3>Vue</h3>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <div className={styles['stage-description']}>
                    <section>
                        <div>
                            <h3>Feature Packed</h3>
                            <p>
                                The performance, feature set and quality of AG Grid has not been seen before in a
                                JavaScript datagrid. Many features in AG Grid are unique to AG Grid, and simply put
                                AG Grid into a class of its own, without compromising on quality or performance.
                            </p>
                        </div>
                        <div>
                            <h3>Industry Leading</h3>
                            <p>
                                Over 1.2 million monthly downloads of AG Grid Community and over 80% of the Fortune 500
                                using AG Grid Enterprise. AG Grid has become the JavaScript datagrid of choice for Enterprise
                                JavaScript developers.
                            </p>
                        </div>
                        <div>
                            <h3>Community & Enterprise</h3>
                            <p>
                                AG Grid Community is free and open-sourced under the MIT license. AG Grid Enterprise comes with
                                dedicated support and more enterprise style features. AG Grid gives for free what other grids
                                charge for, then provides AG Grid Enterprise where it goes above and beyond the competition.
                            </p>
                        </div>
                    </section>
                </div>

                <div className={styles['stage-scenarios']}>
                    <h2 className={styles['heading-scenarios']}>Live Streaming Updates</h2>
                    <section>
                        <div className={styles['demo']}>
                            {showGrid && <React.Suspense fallback={<div>Loading...</div>}>
                                <LiveStreamingDemo />
                            </React.Suspense>}
                        </div>
                    </section>
                </div>

                <div className={styles['stage-scenarios']}>
                    <h2 className={styles['heading-scenarios']}>Integrated Charting</h2>
                    <section>
                        <div className={styles['demo']}>
                            {showGrid && <React.Suspense fallback={<div>Loading...</div>}>
                                <ChartingDashboardDemo />
                            </React.Suspense>}
                        </div>
                    </section>
                </div>

                <div className={styles['stage-sponsorships']}>
                    <section className={styles['stage-sponsorships__sponsorships']}>
                        <div>
                            <h2>Supporting Open Source</h2>
                            <h3>We are proud to sponsor the tools we use and love.</h3>
                        </div>
                        <div>
                            <div className={styles['media']}>
                                <img src="images/fw-logos/webpack.svg" alt="Webpack"/>
                                <div className={styles['media-body']}>
                                    <h3>Webpack</h3>
                                    <p><a href="https://medium.com/webpack/ag-grid-partners-with-webpack-24f8cf9d890b">Read about our Partnership with
                                        webpack.</a></p>
                                </div>
                            </div>
                            <div className={styles['media']}>
                                <img src="images/fw-logos/plunker.svg" alt="Plunker"/>
                                <div className={styles['media-body']}>
                                    <h3>Plunker</h3>
                                    <p><a href="https://medium.com/ag-grid/plunker-is-now-backed-by-ag-grid-601c17440fca">Read about our Backing of
                                        Plunker.</a></p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
                <Footer/>
            </div>
        </>
    );
}

export default Default;
