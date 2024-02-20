import classnames from 'classnames';
import React from 'react';
import Gif from './Gif';
import { useGlobalContext } from './GlobalContext';
import styles from '@design-system/modules/ImageCaption.module.scss';
import { getImage, useImageFileNodes } from './use-image-file-nodes';

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
    width,
    toggledarkmode: toggleDarkMode,
    filterdarkmode: filterDarkMode,
    auto,
}) => {
    const { fluidImages, images } = useImageFileNodes();
    const { darkMode } = useGlobalContext();

    const style = {};

    if (width != null) {
        style.width = width;
    }
    if (minWidth != null) {
        style.minWidth = minWidth;
    }
    if (maxWidth != null) {
        style.maxWidth = maxWidth;
    }
    if (height != null) {
        style.height = height;
    }

    const description = children && (
        <div
            className={classnames(styles.body, {
                [styles.top]: descriptionTop,
            })}
        >
            <div className={styles.bodyText}>{children}</div>
        </div>
    );

    if (toggleDarkMode) {
        const splitName = src.split('.');
        const extension = splitName[splitName.length - 1];
        src = src.replace(`-dark.${extension}`, `.${extension}`);
        if (darkMode) {
            src = src.replace(`.${extension}`, `-dark.${extension}`);
        }
    }

    let imgSrc;
    const fluidImage = getImage(fluidImages, pageName, src);

    if (fluidImage) {
        imgSrc = fluidImage.childImageSharp.gatsbyImageData.images.fallback.src;
    } else {
        const image = getImage(images, pageName, src);

        if (image) {
            imgSrc = image.publicURL;
        }
    }

    if (!imgSrc) {
        throw new Error(`Could not find requested image: ${src}`);
    }


    return (
        <div
            className={classnames(styles.imageCaption, {
                [styles.centered]: centered,
                [styles.constrained]: constrained,
                [styles.darkmodeFilter]: filterDarkMode,
            })}
            style={style}
        >
            {descriptionTop && description}
            {src.endsWith('.gif') ? (
                <Gif src={src} alt={alt} className={styles.image} wrapped={true} toggledarkmode={toggleDarkMode} autoPlay={!!auto} />
            ) : (
                <img src={imgSrc} className={styles.image} alt={alt} />
            )}
            {!descriptionTop && description}
        </div>
    )
};

export default ImageCaption;
