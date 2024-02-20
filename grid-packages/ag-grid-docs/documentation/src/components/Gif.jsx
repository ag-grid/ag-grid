import classnames from 'classnames';
import React from 'react';
import isDevelopment from 'utils/is-development';
import isServerSideRendering from 'utils/is-server-side-rendering';
import styles from '@design-system/modules/Gif.module.scss';
import { useGlobalContext } from './GlobalContext';
import { getImage, useImageFileNodes } from './use-image-file-nodes';

/**
 * This renders a player for GIFs, so a static image of the first frame will be loaded when the page first loads, and a
 * play button will be shown over it, which the user can click to load and play the GIF image.
 */
const Gif = ({ pageName, src, alt, autoPlay, className, wrapped, children, toggledarkmode: toggleDarkMode, ...props }) => {
    const { images } = useImageFileNodes();
    const { darkMode } = useGlobalContext();
    const classes = classnames(styles.gif, { [styles.wrapped]: wrapped }, className);

    if (isServerSideRendering()) {
        const image = getImage(images, pageName, src);
        if (!image) {
            throw new Error(`Could not find ${src} for ${pageName}`);
        }
        return <img src={image.publicURL.replace('.gif', '-still.png')} alt={alt} className={classes} {...props} />;
    }

    const GifPlayer = require('react-gif-player');

    if (toggleDarkMode) {
        const splitName = src.split('.');
        const extension = splitName[splitName.length - 1];
        src = src.replace(`-dark.${extension}`, `.${extension}`);
        if (darkMode) {
            src = src.replace(`.${extension}`, `-dark.${extension}`);
        }
    }
    const image = getImage(images, pageName, src);

    if (!image) {
        throw new Error(`Could not find ${src} for ${pageName}`);
    }

    if (!image.publicURL.endsWith('.gif')) {
        return <img src={image.publicURL.replace('.gif', '-still.png')} alt={alt} className={classes} {...props} />;
    }

    return (
        <GifPlayer
            gif={image.publicURL}
            still={isDevelopment() ? undefined : image.publicURL.replace('.gif', '-still.png')}
            className={classes}
            autoplay={autoPlay}
            alt={alt}
            {...props}
        />
    );
};

export default Gif;
