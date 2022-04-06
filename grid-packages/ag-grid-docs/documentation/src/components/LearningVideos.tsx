import React, {useEffect, useState} from 'react';
import classnames from 'classnames';
import styles from './LearningVideos.module.scss';
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
                <div className={classnames(styles["learning-videos__video__anchor-body"])} >
                    <div className={classnames(styles['learning-videos__video__anchor-body__index']) }>{index}</div>
                    <div>
                        <h2>{title}</h2>
                        <div className={classnames(styles["learning-videos__video__anchor-body__body"])}>
                            <div className={classnames(styles["learning-videos__video__anchor-body__body__video-content"])}>
                                <img style={{height: 100}} alt={thumbnail.alt} src={`${hostPrefix}/videos/${thumbnail.image}`}/>
                                <h5 className={classnames(styles["learning-videos__video__anchor-body__body__video-content__running-time"])}>{runningTime}</h5>
                            </div>
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
const LearningVideos = () => {
    const [videos, setVideos] = useState<VideoData[]>([]);

    useEffect(() => {
        fetch(`${hostPrefix}/videos/videos.json`)
            .then(response => response.json())
            .then(resultData => {
                setVideos(resultData);
            })
    }, [])


    return (
        <div className={classnames(styles["learning-videos"])}>
            {videos.map((video, index) => {
                return (<Video {...video} index={index + 1} key={video.url}/>)
            })}
        </div>
    )
};

export default LearningVideos;


