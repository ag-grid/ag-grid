import React, { useState } from 'react';
import styles from '@design-system/modules/community-section/news-updates/Videos.module.scss';
import videos from '../../../content/community/news-updates/videos.json';

const Videos = () => {
  const [currentVideo, setCurrentVideo] = useState(videos[0]);

  const handleVideoSelect = (video) => {
    setCurrentVideo(video);
  };

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.leftColumn}>
          <h1>{currentVideo.title}</h1>
          <p>{currentVideo.description}</p>
        </div>
        <div className={styles.rightColumn}>
          <iframe
            className={styles.videoFrame}
            src={currentVideo.link}
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>
      </div>
      <div className={styles.videoContainer}>
        {videos.slice(1,videos.length).map((video, index) => (
          <div key={index} onClick={() => handleVideoSelect(video)} className={styles.video}>
            <img src={`https://img.youtube.com/vi/${video.id}/0.jpg`} alt="Video thumbnail" className={styles.videoThumbnail} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Videos;
