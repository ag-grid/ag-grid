import { Icon } from '@components/icon/Icon';
import styles from '@design-system/modules/CommunityShowcase.module.scss';
import React from 'react';

import menu from '../../content/community/community-menu.json';
import showcase from '../../content/community/showcase.json';

const GitHubDetails = ({ favouritesOnly, repo }) => {
    if (repo != '' && repo != undefined && favouritesOnly) {
        const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
        const match = repo?.match(regex);
        return (
            <div className={styles.gitHubDetails}>
                <img alt="GitHub Repo stars" src={`https://img.shields.io/github/stars/${match[1]}/${match[2]}`} />
            </div>
        );
    } else {
        return (
            <div className={styles.gitHubDetails}>
                <Icon name="github" svgClasses={styles.gibHubIcon }/>
            </div>
        );
    }
};

const Showcase = ({ favouritesOnly = false, maxItems = -1 }) => {
    const selectedShowcase = favouritesOnly ? showcase.favourites : showcase.other;
    const productsSortedByStars = selectedShowcase.sort((a, b) => b.stars - a.stars);
    const products = maxItems === -1 ? productsSortedByStars : productsSortedByStars.slice(0, maxItems);

    return (
        <div className={styles.cardContainer}>
            {products.map((product, index) => (
                <div onClick={() => window.open(product.link)} key={index} target="_blank">
                    <div className={`${styles.card} ${favouritesOnly ? "" : styles.smallCard}`}>
                        {favouritesOnly && (
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
                        )}
                        <div className={styles.body}>
                            <div target="_blank" onClick={() => window.open(product.repo)}>
                                <GitHubDetails favouritesOnly={favouritesOnly} repo={product.repo} />
                            </div>
                            <div className={styles.titleContainer}>
                                <p className={styles.title}>{product.title}</p>
                            </div>
                            <p className={styles.description}>{product.description}</p>
                        </div>
                        {favouritesOnly && <div className={styles.footer}>
                            {product.frameworks?.map((framework, index) => (
                                <span key={'framework-' + index} className={styles.tags}>
                                    <img
                                        src={`/community/frameworks/${framework.toLowerCase()}.svg`}
                                        style={{ width: 18, height: 18, marginRight: 6 }}
                                    />
                                    <p>{framework}</p>
                                </span>
                            ))}
                            {product.tags?.map((tag, index) => (
                                <span key={'tag-' + index} className={styles.tags}>
                                    {tag}
                                </span>
                            ))}
                        </div>}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Showcase;
