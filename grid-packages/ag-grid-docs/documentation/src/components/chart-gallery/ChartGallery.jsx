import React from 'react';
import chartGallery from '../../pages/charts-overview/gallery.json';
import thumbnails from './thumbnails';
import toKebabCase from '../../utils/to-kebab-case';
import styles from './chart-gallery.module.scss';

const ChartGallery = () => {
    const categories = Object.keys(chartGallery);

    return <>
        <h2 id='gallery' className={styles.chartGallery__title}>Gallery</h2>

        {categories.map(c => <GallerySection key={c} title={c} exampleNames={Object.keys(chartGallery[c])} />)}
    </>;
};

const GallerySection = ({ title, exampleNames }) =>
    <>
        <h3 id={toKebabCase(title)} className={styles.chartGallery__title}>{title}</h3>

        <div className={styles.chartGallery}>
            {exampleNames.map(name => <GalleryItem key={`${title}_${name}`} name={name} />)}
            {[...new Array((3 - exampleNames.length % 3) % 3)].map((_, i) => <EmptyGalleryItem key={`empty_${i}`} />)}
        </div>
    </>;

const GalleryItem = ({ name }) => {
    const kebabCase = toKebabCase(name);

    return <div className={styles.chartGalleryItem}>
        <a href={`./${kebabCase}/`} className={styles.chartGalleryItem__link}>
            <img className={styles.chartGalleryItem__thumbnail} src={thumbnails[kebabCase]} alt={name} /><br />
            <div className={styles.chartGalleryItem__name}>{name}</div>
        </a>
    </div>;
};

const EmptyGalleryItem = () => <div className={`${styles.chartGalleryItem} ${styles.chartGalleryItemEmpty}`}></div>;

export default ChartGallery;
