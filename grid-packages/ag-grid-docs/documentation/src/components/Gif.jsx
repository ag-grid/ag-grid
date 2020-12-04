import React from 'react';
import classnames from 'classnames';
import { useImageFileNodes, getImage } from './use-image-file-nodes';
import styles from './Gif.module.scss';

const Gif = ({ pageName, src, alt, className, wrapped, children, ...props }) => {
    const { images } = useImageFileNodes();
    const image = getImage(images, pageName, src);

    if (!image) {
        throw new Error(`Could not find requested image: ${src}`);
    }

    return <img
        data-gifffer={image.publicURL}
        data-gifffer-alt={alt}
        alt={alt}
        className={classnames(className, styles['gif'], { [styles['gif--wrapped']]: wrapped })}
        {...props} />;
};

export default Gif;