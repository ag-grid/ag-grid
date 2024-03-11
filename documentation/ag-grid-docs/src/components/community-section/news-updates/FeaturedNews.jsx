import styles from '@design-system/modules/community-section/news-updates/FeaturedNews.module.scss';
import React from 'react';

import featuredNews from '../../../content/community/news-updates/featured-news.json';

const FeaturedNews = () => {
    return (
        <div className={styles.gridContainer}>
            {featuredNews.map((article, index) => (
                <a href={article.link} target="_blank" className={styles.linkWrapper} key={index}>
                    <div className={styles.card}>
                        <img src={article.image} alt="Image Description" className={styles.articleImage} />
                        <div className={styles.content}>
                            <div class={styles.headerTitleDescription}>
                                <h2 className={styles.articleTitle}>{article.title}</h2>
                                <p className={styles.articleDescription}>{article.description}</p>
                            </div>
                            <a target="_blank" href={article.link} className={styles.learnMoreLink}>
                                {article.linkText} →
                            </a>
                        </div>
                    </div>
                </a>
            ))}
        </div>
    );
};

export default FeaturedNews;
