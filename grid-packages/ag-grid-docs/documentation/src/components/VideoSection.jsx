import classnames from 'classnames';
import React from 'react';
import styles from './VideoSection.module.scss';

/**
 * This embeds a YouTube video into the page.
 */
const VideoSection = ({ id, title, header, children }) => (
    <div className={classnames(styles.videoSection, 'ag-styles')}>
        <p className={classnames({ [styles.header]: header })}>{children}</p>
        <iframe
            className={styles.ytIframe}
            title={title}
            src={`https://www.youtube.com/embed/${id}`}
            frameBorder="0"
            modestbranding="1"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
        />
    </div>
);

export default VideoSection;
