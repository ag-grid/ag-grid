import React from 'react';
import styles from './video-link.module.scss';

const VideoLink = ({ src, time, iconName = 'youtube' }) => (
    <div className={ styles.videoLink }>
        <img src={`/images/${iconName}_icon.png`} alt={ iconName } />
        <a href={ src } target='_blank' rel='noreferrer'>{`Watch this section of our docs in our video tutorial [${time}]`}</a>
    </div>
);

export default VideoLink;