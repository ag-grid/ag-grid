import React from 'react';
import classnames from 'classnames';
import Gif from './Gif';
import { useImageFileNodes, getImage } from './use-image-file-nodes';
import styles from './ImageCaption.module.scss';

/**
 * This can be used to show an image in a box, along with text if provided, and provides various options for configuring
 * the appearance.
 */
const ImageCaption = ({
    pageName,
    src,
    alt,
    centered,
    children,
    constrained,
    descriptiontop: descriptionTop,
    height,
    maxwidth: maxWidth,
    minwidth: minWidth,
    width }) => {
    const { fluidImages, images } = useImageFileNodes();

    let imgSrc;

    const fluidImage = getImage(fluidImages, pageName, src);

    if (fluidImage) {
        imgSrc = fluidImage.childImageSharp.fluid.src;
    } else {
        const image = getImage(images, pageName, src);

        if (image) {
            imgSrc = image.publicURL;
        }
    }

    if (!imgSrc) {
        throw new Error(`Could not find requested image: ${src}`);
    }

    const style = {};

    if (width != null) { style.width = width; }
    if (minWidth != null) { style.minWidth = minWidth; }
    if (maxWidth != null) { style.maxWidth = maxWidth; }
    if (height != null) { style.height = height; }

    const description = children &&
        <div className={classnames(styles['image-caption__body'], { [styles['image-caption__body--description-top']]: descriptionTop })}>
            <div className={styles['image-caption__body-text']}>{children}</div>
        </div>;

    const imageClasses = classnames(
        styles['image-caption__image'],
        {
            [styles['image-caption__image--centered']]: centered,
            [styles['image-caption__image--constrained']]: constrained,
        });

    return (
        <div className={classnames(styles['image-caption'], { [styles['image-caption--centered']]: centered, [styles['image-caption--constrained']]: constrained })} style={style}>
            {descriptionTop && description}
            {src.endsWith('.gif') ?
                <Gif src={src} alt={alt} className={imageClasses} wrapped={true} /> :
                <img src={imgSrc} className={imageClasses} alt={alt} />}
            {!descriptionTop && description}
        </div>
    );
};

export default ImageCaption;