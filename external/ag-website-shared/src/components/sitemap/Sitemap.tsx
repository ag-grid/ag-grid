import classnames from 'classnames';
import styles from './sitemap.module.scss';

export type CategorizedSitemap = {
    [category: string]: { url: string; pageName: string }[];
};

interface Props {
    sitemap: CategorizedSitemap;
}

export const Sitemap = (props: Props) => {
    return (
        <div className={classnames('layout-max-width-small', styles.container)}>
            {Object.keys(props.sitemap).map((category, categoryIndex) => (
                <div className={styles.categoryContainer} key={categoryIndex}>
                    <h2 className={styles.categoryTitle}>{category}</h2>
                    <div className={styles.linkContainer}>
                        {props.sitemap[category]?.map((url, urlIndex) => (
                            <a className={styles.link} key={urlIndex} href={url.url}>
                                {url.pageName}
                            </a>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
