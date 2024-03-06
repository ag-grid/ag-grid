import styles from '@design-system/modules/community-section/news-updates/FeaturedNews.module.scss';
import React from 'react';

import featuredNews from '../../../content/community/news-updates/featured-news.json';

const FeaturedNews = () => {
    const allArticles = [featuredNews.major_article, ...featuredNews.minor_articles];

    return (
        <div className={styles.gridContainer}>
            {allArticles.map((article, index) => (
                <a href={article.link} target="_blank" className={styles.linkWrapper} key={index}>
                    <div className={styles.card}>
                        <img src={article.image} alt="Image Description" className={styles.articleImage} />
                        <div className={styles.content}>
                            <div class={styles.headerTitleDescription}>
                                <h2 className={styles.articleTitle}>{article.title}</h2>
                                <p className={styles.articleDescription}>{article.description}</p>
                            </div>
                            <a target="_blank" href={article.link} className={styles.learnMoreLink}>
                                Read article →
                            </a>
                        </div>
                    </div>
                </a>
            ))}
        </div>
    );
};

export default FeaturedNews;
