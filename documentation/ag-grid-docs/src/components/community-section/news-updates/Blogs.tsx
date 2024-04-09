import styles from '@legacy-design-system/modules/CommunityBlogs.module.scss';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';

const Blogs = ({ blogs }) => {
    return (
        <div className={styles.gridContainer}>
            {blogs.map((article) => (
                <a href={article.link} target="_blank" className={styles.linkWrapper} key={article.link}>
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
                            <span className={styles.learnMoreLink}>{article.linkText} →</span>
                        </div>
                    </div>
                </a>
            ))}
        </div>
    );
};

export default Blogs;
