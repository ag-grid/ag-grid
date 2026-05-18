import { useDarkmode } from '@utils/hooks/useDarkmode';
import classnames from 'classnames';
import { useMemo } from 'react';
import GifPlayer from 'react-gif-player';

import styles from './Gif.module.scss';

interface Props {
    imageSrc: string;
    darkModeImageSrc: string;
    stillImageSrc: string;
    darkModeStillImageSrc: string;
    alt: string;
    autoPlay?: boolean;
    wrapped?: boolean;
    className?: string;
}

/**
 * This renders a player for GIFs, so a static image of the first frame will be loaded when the page first loads, and a
 * play button will be shown over it, which the user can click to load and play the GIF image.
 */
export const Gif = ({
    imageSrc,
    darkModeImageSrc,
    stillImageSrc,
    darkModeStillImageSrc,
    alt,
    autoPlay,
    className,
    wrapped,
    ...props
}: Props) => {
    const [darkMode] = useDarkmode();

    const classes = classnames(styles.gif, { [styles.wrapped]: wrapped }, className);

    const gif = useMemo(() => (darkMode ? darkModeImageSrc : imageSrc), [darkMode, darkModeImageSrc, imageSrc]);
    const stillImage = useMemo(
        () => (darkMode ? darkModeStillImageSrc : stillImageSrc),
        [darkMode, darkModeStillImageSrc, stillImageSrc]
    );

    return <GifPlayer gif={gif} still={stillImage} className={classes} autoplay={autoPlay} alt={alt} {...props} />;
};
