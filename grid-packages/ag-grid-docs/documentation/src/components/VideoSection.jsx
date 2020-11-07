import React from 'react';
import styles from './video-section.module.scss';

const VideoSection = ({ src, title, children }) => (
    <div className={ styles.videoSection }>
        <p>
            {children}
        </p>
        <iframe
            title={title}
            src={src} 
            frameborder='0'
            modestbranding='1'
            allow='accelerometer; encrypted-media; gyroscope; picture-in-picture' 
            allowfullscreen>
        </iframe>
    </div>
);

export default VideoSection;