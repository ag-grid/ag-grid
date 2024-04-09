import styles from '@legacy-design-system/modules/LearningVideos.module.scss';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import classnames from 'classnames';
import { useEffect, useState } from 'react';

type VideoData = {
    title: string;
    url: string;
    thumbnail: {
        image: string;
        altText: string;
    };
    keyPoints?: string[];
    runningTime: string;
};

const Video = ({ title, url, thumbnail, keyPoints, runningTime }: VideoData) => {
    return (
        <a className={styles.video} href={url} target="_blank">
            <img alt={thumbnail.altText} src={urlWithBaseUrl(`/videos/${thumbnail.image}`)} />

            <div className={styles.body}>
                <div className={styles.titleDurationWrapper}>
                    <span className={styles.title}>{title}</span>
                    <span className={styles.duration}>{runningTime}</span>
                </div>
                <ul>{keyPoints?.map((keyPoint: string) => <li key={keyPoint}>{keyPoint}</li>)}</ul>
            </div>
        </a>
    );
};

export const LearningVideos = ({ framework }: { framework: string }) => {
    const [videos, setVideos] = useState<{ [framework: string]: VideoData[] }>({});
    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;

        fetch(urlWithBaseUrl('/videos/videos.json'), { signal })
            .then((response) => response.json())
            .then((resultData) => setVideos(resultData))
            .catch(() => {});
        return () => controller.abort();
    }, []);

    const frameworkVideos = videos && videos[framework] && videos[framework].length > 0 ? videos[framework] : [];

    return (
        <ol className={classnames('list-style-none', styles.learningVideos)}>
            {frameworkVideos.map((video: VideoData) => {
                return (
                    <li key={video.url}>
                        <Video {...video} />
                    </li>
                );
            })}
        </ol>
    );
};
