import React from 'react';
import classnames from 'classnames';
import styles from './VideoSection.module.scss';

/**
 * This embeds a YouTube video into the page.
 */
const VideoSection = ({ id, title, header, children }) => (
    <div className={styles['video-section']}>
        <p className={classnames({ [styles['video-section--header']]: header })}>
            {children}
        </p>
        <iframe
            className={styles['video-section__frame']}
            title={title}
            src={`https://www.youtube.com/embed/${id}`}
            frameBorder="0"
            modestbranding="1"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen />
    </div>
);

export default VideoSection;