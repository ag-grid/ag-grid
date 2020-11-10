import React from 'react';
import YouTubeIcon from '../images/youtube-icon.png';
import styles from './video-link.module.scss';

const VideoLink = ({ src, time }) => (
    <div className={styles.videoLink}>
        <img src={YouTubeIcon} alt='YouTube' />
        <a href={src} target='_blank' rel='noreferrer'>{`Watch this section of our docs in our video tutorial [${time}]`}</a>
    </div>
);

export default VideoLink;