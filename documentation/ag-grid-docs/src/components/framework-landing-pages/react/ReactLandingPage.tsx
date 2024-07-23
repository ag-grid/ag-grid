import styles from './ReactLandingPage.module.scss';
import Customers from './sections/customers/Customers';
import Examples from './sections/examples/Examples';
import FeaturesSection from './sections/features/FeaturesSection';
import HeroSection from './sections/hero/HeroSection';
import Showcase from './sections/showcase/Showcase';
import Divider from './utils/Divider';

export const ReactLandingPage = () => {
    return (
        <div className={styles.container}>
            <div className={styles.sectionContent}>
                <HeroSection />
            </div>
            <Divider odd={false} />
            <div className={styles.sectionOdd}>
                <div className={styles.headingContainer}>
                    <h2 className={styles.tag}>Why Choose AG Grid?</h2>
                    <h3 className={styles.heading}>Amazingly Fast, Fully Customisable and Unbeatable Features</h3>
                    <h4 className={styles.subHeading}>
                        Get started in minutes and access 1000s of features without compromising on performance.
                        Customise the grid with your own styles and components or upgrade to enterprise to take your
                        application to the next level.
                    </h4>
                </div>
                <FeaturesSection />
            </div>
            <Divider odd={true} />
            <div className={styles.sectionContent}>
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
            <Divider odd={false} />
            <div className={styles.sectionOdd}>
                <div className={styles.headingContainer}>
                    <h2 className={styles.tag}>Who Uses AG Grid?</h2>
                    <h3 className={styles.heading}>
                        Loved By Developers<br></br>Trusted By The Worlds Biggest Enterprises
                    </h3>
                    <h4 className={styles.subHeading}>
                        AG Grid is used by over 90% of the fortune 500 with 1,000,000 npm downloads per week and over
                        12,000 Stars on Github.
                    </h4>
                </div>
                <Customers />
            </div>
            <Divider odd={true} />
            <div className={styles.sectionContent}>
                <div className={styles.headingContainer}>
                    <h2 className={styles.tag}>How Do I Get Started?</h2>
                    <h3 className={styles.heading}>Get Started with Common Templates</h3>
                    <h4 className={styles.subHeading}>
                        The samples below show how to use of AG Grids most popular & powerful features.
                    </h4>
                </div>
                <Examples />
            </div>
            <Divider odd={false} />
            <div>
                <h3>Benchmarks</h3>
                <p>
                    A simple chart showing benchmarking of load/scroll times with a huge grid, compared to our
                    competitors
                </p>
                <h4 className={styles.subHeading}>
                    <ul>
                        <li>Speed comparison w/ MUI</li>
                        <li>Feature comparison w/ MUI</li>
                    </ul>
                </h4>
            </div>
            {/* FAQs - Community vs. Enterprise,  etc... */}
            <div>
                <h3>FAQs</h3>
                <p>simple list of common questions</p>
                <h4 className={styles.subHeading}>
                    <ul>
                        <li>Community Vs. Enterprise</li>
                        <li>Is AG Grid free</li>
                        <li>AG Charts compatibility</li>
                        <li>Can AG Grid be customised</li>
                        <li>Why use AG Grid over MUI</li>
                        <li>Why use AG Grid over React Table</li>
                        <li>More TBC</li>
                    </ul>
                </h4>
            </div>
        </div>
    );
};
