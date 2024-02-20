import React from 'react';
import newsStyles from '@design-system/modules/CommunityNews.module.scss';
import styles from '@design-system/modules/GridDocs.module.scss';
import classnames from 'classnames';
import SEO from '../components/SEO';

const NewsAndUpdates = () => {
    return (
        <>
            <div id="doc-page-wrapper" className={styles['doc-page-wrapper']}>
                <div id="doc-content" className={classnames('doc-content', styles['doc-page'])}>
                    <SEO title="Community" description="Explore the AG Grid community" />
                    <header className={styles.docsPageHeader}>
                        <h1 id="top" className={styles.docsPageTitle}>
                            <div className={styles.pageTitleContainer}>
                                <div className={styles.pageTitleGroup}>
                                    <span>News & Updates</span>
                                </div>
                            </div>
                        </h1>
                    </header>
                    <span>The latest news from AG Grid, including blogs, events, videos, podcasts, and more...</span>
                    <div>
                        <h2 className={newsStyles.sectionTitle}>Latest News</h2>
                        <div className={newsStyles.container}>
                            <div className={newsStyles.leftColumn}>
                                <img
                                    src="../../images/community/sample.png"
                                    alt="Self-Care"
                                    className={newsStyles.image}
                                />
                                <h1 style={{paddingTop: "4px"}}>Featured Article</h1>
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                            </div>
                            <div className={newsStyles.rightColumn}>
                                <div className={newsStyles.article}>
                                    <img
                                        src="../../images/community/sample.png"
                                        alt="Aluminum in Deodorant"
                                        className={newsStyles.smallImage}
                                    />
                                    <div className={newsStyles.articleText}>
                                        <h2>Article 1</h2>
                                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod temp</p>
                                    </div>
                                </div>
                                <div className={newsStyles.article}>
                                    <img
                                        src="../../images/community/sample.png"
                                        alt="Anaerobic Exercise"
                                        className={newsStyles.smallImage}
                                    />
                                    <div className={newsStyles.articleText}>
                                        <h2>Article 2</h2>
                                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod temp</p>
                                    </div>
                                </div>
                                <div className={newsStyles.article}>
                                    <img
                                        src="../../images/community/sample.png"
                                        alt="Anaerobic Exercise"
                                        className={newsStyles.smallImage}
                                    />
                                    <div className={newsStyles.articleText}>
                                        <h2>Article 3</h2>
                                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod temp</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr></hr>
                    <div>
                        <h2 className={newsStyles.sectionTitle}>Events</h2>
                        <span>World map, with pins on the events we're sponsoring - to show we're global</span>
                    </div>
                    <div>
                        <h2 className={newsStyles.sectionTitle}>Videos</h2>
                        <span>A carousel of videos</span>
                    </div>
                    <div>
                        <h2 className={newsStyles.sectionTitle}>Podcasts</h2>
                        <span>AG Grid Data Grid podcast player, of all our podcast appearances</span>
                    </div>
                    <div>
                        <h2 className={newsStyles.sectionTitle}>Sponsorships</h2>
                        <span>
                            A sponsorship chart, similar to TanStack: https://tanstack.com/
                        </span>
                        <ul>
                            <li>
                                <span>Plunkr</span>
                            </li>
                            <li>
                                <span>Webpack</span>
                            </li>
                            <li>
                                <span>TanStack Table</span>
                            </li>
                            <li>
                                <span>Webrush</span>
                            </li>
                            <li>
                                <span>Angular Nation</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
};

export default NewsAndUpdates;
