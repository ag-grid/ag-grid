import styles from '@design-system/modules/community-section/news-updates/FeaturedNews.module.scss';
import React from 'react';

import featuredNews from '../../../content/community/news-updates/featured-news.json';

const FeaturedNews = () => {
    return (
        <div className={styles.container}>
            <div className={styles.leftColumn}>
                <div className={styles.card}>
                    <img src={featuredNews.major_article.image} alt="Image Description" />
                    <div className={styles.content}>
                        <h2>{featuredNews.major_article.title}</h2>
                        <span className={styles.leftColumnDescription}>{featuredNews.major_article.description}</span>
                        <a href={featuredNews.major_article.link}>Learn More</a>
                    </div>
                </div>
            </div>
            <div className={styles.rightColumn}>
                {featuredNews.minor_articles.map((article, index) => (
                    <div key={index} className={`${styles.card} ${styles.horizontal}`}>
                        <img src={article.image} className={styles.minorArticleImage} alt="Image Description" />
                        <div className={styles.content}>
                            <h2 className={styles.rightColumnTitle}>{article.title}</h2>
                            <p className={styles.rightColumnDescription}>{article.description}</p>
                            <a href={article.link} className={styles.rightColumnLink}>
                                Learn More
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeaturedNews;
