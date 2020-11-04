import React from 'react';
import styles from './image-caption.module.scss';

const ImageCaption = ({ src, alt, centered, width, height, children }) => {
    const style = {};

    if (width != null) { style.width = width; }
    if (height != null) { style.height = height; }
    console.log(styles);

    const className = `${styles.imageCaption} ${centered ? styles.imageCaptionCentered : ''}`;

    return (
        <div className={className} style={style}>
            <img src={src} className={styles.imageCaption__top} alt={alt} />
            <div className={styles.imageCaption__body}>
                <p className={styles.imageCaption__bodyText}>{children}</p>
            </div>
        </div>
    );
}

export default ImageCaption;