import React from 'react';
import toKebabCase from 'utils/to-kebab-case';
import chartGallery from '../../../doc-pages/charts-overview/gallery.json';
import styles from './ChartGallery.module.scss';
import thumbnails from './thumbnails';

/**
 * This used to display the chart gallery on the Standalone Charts Overview page.
 */
const ChartGallery = () => {
    const filter = (c) => !c.startsWith('_');
    const categories = Object.keys(chartGallery).filter(filter);

    return (
        <>
            {categories.map((c) => (
                <GallerySection key={c} title={c} exampleNames={Object.keys(chartGallery[c]).filter(filter)} />
            ))}
        </>
    );
};

const GallerySection = ({ title, exampleNames }) => (
    <div className="font-size-responsive">
        <h3 id={toKebabCase(title)} className={styles.title}>
            {title}
        </h3>
        <div className={styles.chartGallery}>
            {exampleNames.map((name) => (
                <GalleryItem key={`${title}_${name}`} name={name} />
            ))}
        </div>
    </div>
);

const GalleryItem = ({ name }) => {
    const kebabCase = toKebabCase(name);

    return (
        <a href={`../gallery/${kebabCase}/`} className={styles.galleryItem}>
            <img className={styles.thumbnail} src={thumbnails[kebabCase]} alt={name} />
            <span className={styles.name}>{name}</span>
        </a>
    );
};

export default ChartGallery;
