import React from 'react';
import classnames from 'classnames';
import GifPlayer from 'react-gif-player';
import { useImageFileNodes, getImage } from './use-image-file-nodes';
import styles from './Gif.module.scss';

const Gif = ({ pageName, src, autoPlay, className, wrapped, children, ...props }) => {
    const { images } = useImageFileNodes();
    const image = getImage(images, pageName, src);

    if (!image) {
        throw new Error(`Could not find requested image: ${src}`);
    }

    return <GifPlayer
        gif={image.publicURL}
        className={classnames(styles['gif'], { [styles['gif--wrapped']]: wrapped }, className)}
        autoplay={autoPlay}
        {...props}
    />;
};

export default Gif;