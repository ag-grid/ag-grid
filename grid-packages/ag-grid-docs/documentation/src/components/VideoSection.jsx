import React from 'react';
import styles from './video-section.module.scss';

const VideoSection = ({ src, title, header, children }) => (
    <div className={ styles.videoSection }>
        <p className={header ? styles.videoSectionHeader : null }>
            {children}
        </p>
        <iframe
            title={title}
            src={src} 
            frameBorder='0'
            modestbranding='1'
            allow='accelerometer; encrypted-media; gyroscope; picture-in-picture' 
            allowFullScreen={true}>
        </iframe>
    </div>
);

export default VideoSection;