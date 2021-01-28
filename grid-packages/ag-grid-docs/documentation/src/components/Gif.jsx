import React from 'react';
import classnames from 'classnames';
import { useImageFileNodes, getImage } from './use-image-file-nodes';
import isServerSideRendering from 'utils/is-server-side-rendering';
import isDevelopment from 'utils/is-development';
import styles from './Gif.module.scss';

const Gif = ({ pageName, src, alt, autoPlay, className, wrapped, children, ...props }) => {
    const { images } = useImageFileNodes();
    const image = getImage(images, pageName, src);

    if (!image) {
        throw new Error(`Could not find requested image: ${src}`);
    }

    const classes = classnames(styles['gif'], { [styles['gif--wrapped']]: wrapped }, className);

    if (isServerSideRendering() || !image.publicURL.endsWith('.gif')) {
        return <img src={image.publicURL} alt={alt} className={classes} {...props} />;
    }

    const GifPlayer = require('react-gif-player');

    return <GifPlayer
        gif={image.publicURL}
        still={isDevelopment() ? undefined : image.publicURL.replace('.gif', '-still.png')}
        className={classes}
        autoplay={autoPlay}
        alt={alt}
        {...props} />;
};

export default Gif;