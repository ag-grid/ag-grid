import styles from '@design-system/modules/CommunityVideos.module.scss';
import React, { useState } from 'react';

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
                  {/* TODO: GitNation Portal Support */}
                    <iframe
                        className={styles.videoFrame}
                        src={currentVideo.link}
                        frameBorder="0"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
            <div className={styles.videoContainer}>
                {videos.map((video, index) => (
                    <div
                        key={index}
                        onClick={() => handleVideoSelect(video)}
                        className={`${styles.video} ${videos.indexOf(currentVideo) === index ? styles.active : ''}`}
                    >
                    {/* TODO: GitNation Portal Support */}
                    { video.id ? 
                        <img
                            src={`https://img.youtube.com/vi/${video.id}/0.jpg`}
                            alt="Video thumbnail"
                            className={styles.youtubeThumbnail}
                        />
                    : 
                      <img
                            src={`${video.thumbnail}`}
                            alt="Video thumbnail"
                            className={styles.videoThumbnail}
                          />
                    }
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Videos;
