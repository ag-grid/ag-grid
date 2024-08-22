import { useState } from 'react';

import styles from './ReactLandingPage.module.scss';
import Benchmarks from './sections/benchmarks/Benchmarks';
import Customers from './sections/customers/Customers';
import Examples from './sections/examples/Examples';
import Faqs from './sections/faqs/Faqs';
import FeaturesSection from './sections/features/FeaturesSection';
import HeroSection from './sections/hero/HeroSection';
import Showcase from './sections/showcase/Showcase';
import Divider from './utils/Divider';

export const ReactLandingPage = ({ versionsData }) => {
    let isOdd = false;
    const getIsOdd = () => {
        isOdd = !isOdd;
        return !isOdd;
    };

    return (
        <div className={styles.container}>
            <div className={isOdd ? styles.sectionOdd : styles.sectionContent}>
                <HeroSection versionsData={versionsData} />
            </div>
            <Divider odd={getIsOdd()} />
            <div className={isOdd ? styles.sectionOdd : styles.sectionOdd}>
                <div className={styles.headingContainer}>
                    <h2 className={styles.tag}>Why Use AG Grid?</h2>
                    <h3 className={styles.heading}>Amazingly Fast, Fully Customisable and Unbeatable Features</h3>
                    <h4 className={styles.subHeading}>
                        Get started in minutes and access 1000s of features without compromising on performance.
                        Customise your React Table with your own styles and components or upgrade to enterprise to use
                        our advanced features.
                    </h4>
                </div>
                <FeaturesSection />
            </div>
            {/* <Divider odd={getIsOdd()} />
            <div className={isOdd ? styles.sectionOdd : styles.sectionContent}>
                <div className={styles.headingContainer}>
                    <h2 className={styles.tag}>What Can AG Grid Do?</h2>
                    <h3 className={styles.heading}>
                        Every Core Feature, For Free. Advanced Features, Found Nowhere Else.
                    </h3>
                    <h4 className={styles.subHeading}>
                        100s of core features, all available for free, such as Sorting, Filtering, Grouping, and more.
                        Upgrade to Enterprise for Integrated Charting, Pivoting,
                    </h4>
                </div>
                <FeaturesSection />
            </div> */}
            <Divider odd={getIsOdd()} />
            <div className={isOdd ? styles.sectionOdd : styles.sectionContent}>
                <div className={styles.headingContainer}>
                    <h2 className={styles.tag}>Where is AG Grid Used?</h2>
                    <h3 className={styles.heading}>Used in Every Industry, for All Types of Data</h3>
                    <h4 className={styles.subHeading}>
                        Trusted by 90% of Fortune 500 industries from Finance and AI, to DevTools and Aeronautics. Most
                        of these uses are private, but we've hand-picked a few open-source examples:
                    </h4>
                </div>
                <Showcase />
            </div>
            <Divider odd={getIsOdd()} />
            <div className={isOdd ? styles.sectionOdd : styles.sectionContent}>
                <div className={styles.headingContainer}>
                    <h2 className={styles.tag}>Who Uses AG Grid?</h2>
                    <h3 className={styles.heading}>
                        Loved By Developers<br></br>Trusted By The Worlds Largest Enterprises
                    </h3>
                    <h4 className={styles.subHeading}>
                        Over <b>90% of the Fortune 500</b> build React Tables using AG Grid, with{' '}
                        <span className={styles.highlight}>
                            <a href="https://www.npmjs.com/package/ag-grid-community" target="_blank">
                                1,000,000+
                            </a>
                        </span>{' '}
                        npm downloads per week and over{' '}
                        <span className={styles.highlight}>
                            <a href="https://github.com/ag-grid/ag-grid/tree/latest" target="_blank">
                                12,000
                            </a>
                        </span>{' '}
                        Stars on Github.
                    </h4>
                </div>
                <Customers />
            </div>
            <Divider odd={getIsOdd()} />
            <div className={isOdd ? styles.sectionOdd : styles.sectionContent}>
                <div className={styles.headingContainer}>
                    <h2 className={styles.tag}>How Do I Get Started?</h2>
                    <h3 className={styles.heading}>Get Started with Common Templates</h3>
                    <h4 className={styles.subHeading}>
                        Sample apps to help you build your React Table with AG Grid in minutes.
                    </h4>
                </div>
                <Examples />
            </div>
            {/* <Divider odd={getIsOdd()} />
            <div className={isOdd ? styles.sectionOdd : styles.sectionContent}>
                <div className={styles.headingContainer}>
                    <h2 className={styles.tag}>How Does AG Grid Compare to Competition?</h2>
                    <h3 className={styles.heading}>Unbeatable Performance, Unmatched Feature Set</h3>
                    <h4 className={styles.subHeading}>
                        AG Grid is the fastest React Table available with features that aren't found anywhere else
                    </h4>
                </div>
                <Benchmarks />
            </div> */}
            <Divider odd={getIsOdd()} />
            {/* FAQs - Community vs. Enterprise,  etc... */}
            <div className={isOdd ? styles.sectionOdd : styles.sectionContent}>
                <div className={styles.headingContainer}>
                    <h2 className={styles.tag}>How Does AG Grid Compare to Competition?</h2>
                    <h3 className={styles.heading}>Frequently Asked Questions</h3>
                    <h4 className={styles.subHeading}>
                        Answers to some common questions when building React Tables with AG Grid
                    </h4>
                </div>
                <Faqs />
            </div>
        </div>
    );
};
