import React from 'react';
import styles from '@design-system/modules/GridDocs.module.scss';
import newsStyles from '@design-system/modules/CommunityNews.module.scss';
import classnames from 'classnames';
import SEO from '../components/SEO';
import VideoCarousel from './videos'
import PodcastGrid from './podcasts';
import Events from './events';
import FeaturedNews from './featured-news';

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
                    <h2 className={newsStyles.sectionTitle}>Latest News</h2>
                    <span>The latest news from AG Grid, including blogs, events, videos, podcasts, and more...</span>
                    <FeaturedNews />
                    <hr></hr>
                    <div>
                        <h2 className={newsStyles.sectionTitle}>Events</h2>
                        <Events />
                    </div>
                    <div>
                        <h2 className={newsStyles.sectionTitle}>Videos</h2>
                        <span>A carousel of videos</span>
                        <VideoCarousel />
                    </div>
                    <div>
                        <h2 className={newsStyles.sectionTitle}>Podcasts</h2>
                        <span>AG Grid Data Grid podcast player, of all our podcast appearances</span>
                        <PodcastGrid />
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
