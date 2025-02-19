import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import { useState } from 'react';

import styles from './Videos.module.scss';

interface Video {
    title: string;
    link: string;
    description: string;
    author: string;
    type: 'Video' | 'Workshop';
    published: string;
    thumbnail?: string;
    id?: string;
}

const Videos = ({ videos }: { videos: Video[] }) => {
    const [currentVideo, setCurrentVideo] = useState(videos[0]);
    const handleVideoSelect = (video: Video) => {
        setCurrentVideo(video);
    };

    return (
        <div>
            <div className={styles.container}>
                <div className={styles.leftColumn}>
                    <h2>{currentVideo.title}</h2>
                    <p>{currentVideo.description}</p>
                </div>
                <div className={styles.rightColumn}>
                    {/* TODO: GitNation Portal Support */}
                    {currentVideo.thumbnail ? (
                        <img
                            className={styles.videoImage}
                            src={urlWithBaseUrl(currentVideo.thumbnail)}
                            alt="Video thumbnail"
                            onClick={() => window.open(currentVideo.link, '_blank')}
                        />
                    ) : (
                        <iframe
                            className={styles.videoFrame}
                            src={currentVideo.link}
                            frameBorder="0"
                            allowFullScreen
                        ></iframe>
                    )}
                </div>
            </div>

            <div className={styles.videoOuter}>
                <div className={styles.videoContainer}>
                    {videos.map((video, index) => (
                        <div
                            key={index}
                            onClick={() => handleVideoSelect(video)}
                            className={`${styles.video} ${videos.indexOf(currentVideo) === index ? styles.active : ''}`}
                        >
                            {/* TODO: GitNation Portal Support */}
                            {video.id ? (
                                <img
                                    src={`https://img.youtube.com/vi/${video.id}/0.jpg`}
                                    alt="Video thumbnail"
                                    className={styles.youtubeThumbnail}
                                />
                            ) : (
                                <img
                                    src={urlWithBaseUrl(video.thumbnail)}
                                    alt="Video thumbnail"
                                    className={styles.videoThumbnail}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Videos;
