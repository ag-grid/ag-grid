import { Icon } from '@components/icon/Icon';
import styles from '@design-system/modules/community-section/Showcase.module.scss';
import React from 'react';

import menu from '../../content/community/community-menu.json';
import showcase from '../../content/community/showcase.json';

const ShowcaseList = ({ favouritesOnly = false }) => {
    const products = favouritesOnly ? showcase.favourites : showcase.favourites.concat(showcase.other);
    const productsSortedByStars = products.sort((a, b) => b.stars - a.stars);

    return (
        <div className={styles.cardContainer}>
            {productsSortedByStars.map((product, index) => (
                <a href={product.link}>
                    <div className={styles.card}>
                        <div className={styles.header}>
                            <img
                                className={styles.image}
                                src={
                                    product.img
                                        ? `/community/showcase/${product.img}`
                                        : '/community/showcase/sample.png'
                                }
                                alt={product.title}
                            />
                        </div>
                        <div className={styles.body}>
                            <div className={styles.titleContainer}>
                                <p className={styles.title}>{product.title}</p>
                                <a href={product.repo}>
                                    <Icon className={styles.imageButton} name="github" />
                                </a>
                            </div>
                            <p className={styles.description}>{product.description}</p>
                        </div>
                        <div className={styles.footer}>
                            {product.tags?.map((tag, index) => (
                                <span key={'tag-' + index} className={styles.tags}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </a>
            ))}
        </div>
    );
};

export default ShowcaseList;
