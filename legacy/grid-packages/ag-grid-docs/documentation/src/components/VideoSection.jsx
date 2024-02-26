import classnames from 'classnames';
import React, { useEffect, useState } from 'react';
import styles from '@design-system/modules/VideoSection.module.scss';

/**
 * This embeds a YouTube video into the page.
 */
const VideoSection = ({ id, title, header, children }) => {
    const [hasWindow, setHasWindow] = useState(false);
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setHasWindow(true);
        }
    }, []);

    return (
        <>
            {hasWindow && (
                <div className={styles.videoSection}>
                    <div className={classnames({ [styles.header]: header })}>{children}</div>
                    <iframe
                        className={styles.ytIframe}
                        title={title}
                        src={`https://www.youtube-nocookie.com/embed/${id}`}
                        frameBorder="0"
                        modestbranding="1"
                        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            )}
        </>
    );
};

export default VideoSection;
