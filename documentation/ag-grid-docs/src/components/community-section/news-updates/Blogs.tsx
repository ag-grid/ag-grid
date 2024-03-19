import styles from '@design-system/modules/CommunityBlogs.module.scss';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import React from 'react';

import blogs from '../../../content/community/news-updates/blogs.json';

const Blogs = () => {
    return (
        <div className={styles.gridContainer}>
            {blogs.map((article, index) => (
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        window.open(article.link);
                    }}
                    target="_blank"
                    className={styles.linkWrapper}
                    key={index}
                >
                    <div className={styles.card}>
                        <img
                            src={urlWithBaseUrl(article.image)}
                            alt="Blog Cover Image"
                            className={styles.articleImage}
                        />
                        <div className={styles.content}>
                            <div className={styles.headerTitleDescription}>
                                <h2 className={styles.articleTitle}>{article.title}</h2>
                                <p className={styles.articleDescription}>{article.description}</p>
                            </div>
                            <a target="_blank" className={styles.learnMoreLink}>
                                {article.linkText} →
                            </a>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Blogs;
