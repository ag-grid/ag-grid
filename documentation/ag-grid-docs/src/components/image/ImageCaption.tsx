import styles from '@legacy-design-system/modules/ImageCaption.module.scss';
import { useDarkmode } from '@utils/hooks/useDarkmode';
import classnames from 'classnames';
import { useEffect, useState } from 'react';

import { Gif } from './Gif';

interface Props {
    imageSrc: string;
    alt: string;
    centered?: boolean;
    constrained?: boolean;
    descriptionTop?: boolean;
    width?: string;
    height?: string;
    minWidth?: string;
    maxWidth?: string;
    /**
     * Enable styles for dark mode using CSS Filters
     *
     * Alternatively, add `-dark` suffixed image in `imagePath` to add
     * dark mode image manually
     */
    enableDarkModeFilter?: boolean;
    darkModeImageSrc?: string;
    captionHtml?: string;

    isGif?: boolean;
    /**
     * Autoplay gif
     */
    autoPlay?: boolean;
}

/**
 * This can be used to show an image in a box, along with text if provided,
 * and provides various options for configuring the appearance.
 */
export const ImageCaption = ({
    imageSrc,
    alt,
    centered,
    constrained,
    descriptionTop,
    width,
    height,
    maxWidth,
    minWidth,
    enableDarkModeFilter = false,
    darkModeImageSrc,
    gifStillImageSrc,
    gifDarkModeStillImageSrc,
    captionHtml,

    isGif,
    autoPlay,
}: Props) => {
    const [darkMode] = useDarkmode();
    const [src, setSrc] = useState<string>(imageSrc);

    const style: any = {};
    if (width !== undefined) {
        style.width = width;
    }
    if (minWidth !== undefined) {
        style.minWidth = minWidth;
    }
    if (maxWidth !== undefined) {
        style.maxWidth = maxWidth;
    }
    if (height !== undefined) {
        style.height = height;
    }

    const description = captionHtml && (
        <div
            className={classnames(styles.body, {
                [styles.top]: descriptionTop,
            })}
        >
            <div className={styles.bodyText} dangerouslySetInnerHTML={{ __html: captionHtml }}></div>
        </div>
    );

    useEffect(() => {
        if (darkModeImageSrc && darkMode) {
            setSrc(darkModeImageSrc);
        } else {
            setSrc(imageSrc);
        }
    }, [darkMode]);

    return (
        <div
            className={classnames(styles.imageCaption, 'image-caption', {
                [styles.centered]: centered,
                [styles.constrained]: constrained,
                [styles.darkmodeFilter]: enableDarkModeFilter,
            })}
            style={style}
        >
            {descriptionTop && description}
            {isGif ? (
                <Gif
                    imageSrc={src}
                    darkModeImageSrc={darkModeImageSrc}
                    stillImageSrc={gifStillImageSrc}
                    darkModeStillImageSrc={gifDarkModeStillImageSrc}
                    alt={alt}
                    wrapped={true}
                    autoPlay={autoPlay}
                />
            ) : (
                <img src={src} className={styles.image} alt={alt} />
            )}
            {!descriptionTop && description}
        </div>
    );
};
