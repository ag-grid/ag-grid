import styles from '@design-system/modules/community-section/news-updates/FeaturedNews.module.scss';
import React from 'react';

import featuredNews from '../../../content/community/news-updates/featured-news.json';

const FeaturedNews = () => {
    return (
        <div class={styles.gridContainer}>
            <div class={styles.leftColumn}>
                <a href={featuredNews.major_article.link} target="_blank" className={styles.linkWrapper}>
                    <div className={styles.card}>
                        <img src={featuredNews.major_article.image} alt="Image Description" />
                        <div className={styles.content}>
                            <h2>{featuredNews.major_article.title}</h2>
                            <span className={styles.leftColumnDescription}>{featuredNews.major_article.description}</span>
                                <a target="_blank" href={featuredNews.major_article.link}>
                                    Learn More
                                </a>
                        </div>
                    </div>
                </a>
            </div>
            {featuredNews.minor_articles.map((article, index) => (
                <a href={article.link} target="_blank" className={styles.linkWrapper}>
                    <div class={styles.rightColumn}>
                        <div key={index} className={`${styles.card} ${styles.horizontal}`}>
                            <img src={article.image} className={styles.minorArticleImage} alt="Image Description" />
                            <div className={styles.content}>
                                <h2 className={styles.rightColumnTitle}>{article.title}</h2>
                                <p className={styles.rightColumnDescription}>{article.description}</p>
                                <a target="_blank" href={article.link} className={styles.rightColumnLink}>
                                    Learn More
                                </a>
                            </div>
                        </div>
                    </div>
                </a>
            ))}
        </div>
    );
};

export default FeaturedNews;
