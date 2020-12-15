import React from 'react';
import classnames from 'classnames';
import { useImageFileNodes, getImage } from './use-image-file-nodes';
import isServerSideRendering from '../utils/is-server-side-rendering';
import styles from './Gif.module.scss';

const Gif = ({ pageName, src, autoPlay, className, wrapped, children, ...props }) => {
    const { images } = useImageFileNodes();
    const image = getImage(images, pageName, src);

    if (!image) {
        throw new Error(`Could not find requested image: ${src}`);
    }

    const classes = classnames(styles['gif'], { [styles['gif--wrapped']]: wrapped }, className);

    if (isServerSideRendering()) {
        return <img src={image.publicURL} className={classes} {...props} />;
    }

    const GifPlayer = require('react-gif-player');

    return <GifPlayer gif={image.publicURL} className={classes} autoplay={autoPlay} {...props} />;
};

export default Gif;