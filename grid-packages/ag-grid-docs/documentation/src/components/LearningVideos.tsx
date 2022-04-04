import React, {useEffect, useState} from 'react';
import classnames from 'classnames';
import styles from './LearningVideos.module.scss';
import {hostPrefix} from '../utils/consts';

const Video = ({title, url, thumbnail, keyPoints}: any) => {
    return (
        <div className={classnames(styles["learning-videos__video"])}>
            <h2>{title}</h2>
            <div className={classnames(styles["learning-videos__video__body"])}>
                <div className={classnames(styles["learning-videos__video__body__video-content"])}>
                    <a href={url} target="_blank">
                        <img alt={thumbnail.alt} src={`${hostPrefix}/learning-videos/${thumbnail.image}`}/>
                    </a>
                </div>
                <div>
                    <ul>
                        {
                            keyPoints.map((keyPoint: string) => <li>{keyPoint}</li>)
                        }
                    </ul>
                </div>
            </div>
        </div>
    )
}
const LearningVideos = (props: any) => {
    const [videos, setVideos] = useState([]);

    useEffect(() => {
        fetch(`${hostPrefix}/learning-videos/videos.json`)
            .then(response => response.json())
            .then(resultData => {
                setVideos(resultData);
            })
    }, [])

    return (
        <div className={classnames(styles["learning-videos"])}>
            {videos.map(video => {
                return (<Video {...video} key={video.url}/>)
            })}
        </div>
    )
};

export default LearningVideos;


