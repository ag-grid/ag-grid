import React, {useEffect, useState} from 'react';
import classnames from 'classnames';
// @ts-ignore
import styles from './LearningVideos.module.scss';
// @ts-ignore
import {hostPrefix} from '../utils/consts';

type VideoData = {
    title: string;
    url: string;
    thumbnail: {
        image: string;
        altText: string;
    }
    keyPoints?: string[];
    runningTime: string;
}

const Video = ({title, url, thumbnail, keyPoints, runningTime, index}: any) => {
    return (
        <div className={classnames(styles["learning-videos__video"])}>
            <a href={url} target="_blank">
                <div className={classnames(styles["learning-videos__video__anchor-body"])}>
                    <div className={classnames(styles['learning-videos__video__anchor-body__index'])}>{index}</div>
                    <div className={classnames(styles["learning-videos__video__anchor-body__body"])}>
                        <div className={classnames(styles["learning-videos__video__anchor-body__body__video-content"])}>
                            <img alt={thumbnail.alt} src={`${hostPrefix}/videos/${thumbnail.image}`}/>
                            <h5 className={classnames(styles["learning-videos__video__anchor-body__body__video-content__running-time"])}>{runningTime}</h5>
                        </div>
                        <div className={classnames(styles["learning-videos__video__anchor-body__body__video-notes"])}>
                            <h4>{title}</h4>
                            <div>
                                <ul>
                                    {
                                        keyPoints.map((keyPoint: string) => <li key={keyPoint}>{keyPoint}</li>)
                                    }
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </a>
        </div>
    )
}
const LearningVideos = ({framework}: {framework: string}) => {
    const [videos, setVideos] = useState<{[framework: string]: VideoData[]}>({});
    useEffect(() => {
        const controller = new AbortController();
        const {signal} = controller;

        fetch(`${hostPrefix}/videos/videos.json`, {signal})
            .then(response => response.json())
            .then(resultData => setVideos(resultData))
            .catch(() => {
            })
        return () => controller.abort();
    }, [])

    const frameworkVideos = videos && videos[framework] && videos[framework].length > 0 ? videos[framework] : [];

    return (
        <div className={classnames(styles["learning-videos"])}>
            {frameworkVideos.map((video: VideoData, index: number) => {
                return (<Video {...video} index={index + 1} key={video.url}/>)
            })}
        </div>
    )
};

export default LearningVideos;


