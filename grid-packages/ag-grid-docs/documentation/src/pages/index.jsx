import React from 'react';
// @ts-ignore
import styles from './components/assets/homepage/homepage.module.scss';
import FrameworkSelector from '../components/FrameworkSelector';
import Footer from '../components/footer/Footer';
import Seo from "./components/SEO";
import {agGridVersion} from "../utils/consts";

import { Quotes } from '../components/quotes/Quotes';
import { quotesData } from "../components/quotes/quotesData";

const IS_SSR = typeof window === "undefined"

const LiveStreamingDemo = React.lazy(() => import("./components/home-page-demos/LiveStreaming"));
const ChartingDashboardDemo = React.lazy(() => import("./components/home-page-demos/ChartingDashboard"));
const HeroGrid = React.lazy(() => import("./components/home-page-demos/HeroGrid"));

const Default = () => {
    const frameworksData = [
        {
            name: "javascript",
            url: "/javascript-data-grid/",
        },
        {
            name: "react",
            url: "/react-data-grid/",
        },
        {
            name: "angular",
            url: "/angular-data-grid/",
        },
        {
            name: "vue",
            url: "/vue-data-grid/",
        },
        {
            name: "solid",
            url: "/react-data-grid/solidjs/",
        },
    ];    

    return (
        <>
            <Seo title="AG Grid: High-Performance React Grid, Angular Grid, JavaScript Grid"
                 description={`AG Grid is a feature rich datagrid designed for the major JavaScript Frameworks. Version ${agGridVersion} is out now. Easily integrate into your application to deliver filtering, grouping, aggregation, pivoting and much more with the performance that your users expect. Our Community version is free and open source, or take a 2 month trial of AG Grid Enterprise.`}/>
            <div className={styles['root-page-content']}>
                <div className={styles['homepage-hero']}>
                    <section className={styles['contents']}>
                        <section className={styles['headings']}>
                            <h1>The&nbsp;Best&nbsp;JavaScript Grid&nbsp;in&nbsp;the&nbsp;World</h1>
                            <h2>The professional choice for developers building enterprise&nbsp;applications</h2>
                        </section>
                        
                        <section className={styles['hero-grid']}>
                            {!IS_SSR && <React.Suspense fallback={<></>}>
                                <HeroGrid />
                            </React.Suspense>}
                        </section>
                    </section>
                </div>
                <div className={styles['stage-frameworks']}>
                    <span className={styles['stage-frameworks__label']}>Get&nbsp;started</span>

                    <FrameworkSelector data={frameworksData} isFullWidth />
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
                            {!IS_SSR && <React.Suspense fallback={<div>Loading...</div>}>
                                <LiveStreamingDemo />
                            </React.Suspense>}
                        </div>
                    </section>
                </div>

                <div className={`${styles['stage-scenarios']} ${styles['stage-quotes']}`}>
                    <h2 className={styles['heading-scenarios']}>By Developers for Developers</h2>

                    <section>
                        <Quotes data={quotesData} />
                    </section>
                </div>

                <div className={styles['stage-scenarios']}>
                    <h2 className={styles['heading-scenarios']}>Integrated Charting</h2>
                    <section>
                        <div className={styles['demo']}>
                            {!IS_SSR && <React.Suspense fallback={<div>Loading...</div>}>
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
