import React from 'react';
import YouTubeIcon from 'images/youtube-icon.png';
import styles from './VideoLink.module.scss';

/**
 * This provides a link to watch the specified link on YouTube.
 */
const VideoLink = ({ src, time }) => (
    <div className={styles['video-link']}>
        <img src={YouTubeIcon} alt='YouTube' />
        <a className={styles['video-link__link']} href={src} target='_blank' rel='noreferrer'>{`Watch this section of our docs in our video tutorial [${time}]`}</a>
    </div>
);

export default VideoLink;