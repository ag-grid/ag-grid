import React from 'react';
import classnames from 'classnames';
import chartGallery from '../../../doc-pages/charts/gallery.json';
import thumbnails from './thumbnails';
import toKebabCase from 'utils/to-kebab-case';
import styles from './ChartGallery.module.scss';

const ChartGallery = () => {
    const categories = Object.keys(chartGallery);

    return <>
        <h2 id='gallery' className={styles['chart-gallery__title']}>Gallery</h2>
        {categories.map(c => <GallerySection key={c} title={c} exampleNames={Object.keys(chartGallery[c])} />)}
    </>;
};

const GallerySection = ({ title, exampleNames }) =>
    <>
        <h3 id={toKebabCase(title)} className={styles['chart-gallery__title']}>{title}</h3>
        <div className={styles['chart-gallery']}>
            {exampleNames.map(name => <GalleryItem key={`${title}_${name}`} name={name} />)}
            {[...new Array((3 - exampleNames.length % 3) % 3)].map((_, i) => <EmptyGalleryItem key={`empty_${i}`} />)}
        </div>
    </>;

const GalleryItem = ({ name }) => {
    const kebabCase = toKebabCase(name);

    return <div className={styles['chart-gallery-item']}>
        <a href={`./${kebabCase}/`} className={styles['chart-gallery-item__link']}>
            <img className={styles['chart-gallery-item__thumbnail']} src={thumbnails[kebabCase]} alt={name} /><br />
            <div className={styles['chart-gallery-item__name']}>{name}</div>
        </a>
    </div>;
};

const EmptyGalleryItem = () => <div className={classnames(styles['chart-gallery-item'], styles['chart-gallery-item--empty'])}></div>;

export default ChartGallery;
