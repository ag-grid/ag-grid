import { Icon } from '@ag-website-shared/components/icon/Icon';
import { useDarkmode } from '@utils/hooks/useDarkmode';
import classnames from 'classnames';
import { useEffect, useRef, useState } from 'react';

import styles from './Video.module.scss';

interface Props {
    videoSrc: string;
    darkModeVideoSrc?: string;
    autoplay?: boolean;
    showPlayPauseButtons?: boolean;
}

export const Video = ({ videoSrc, darkModeVideoSrc, autoplay = true, showPlayPauseButtons = true }: Props) => {
    const [darkMode] = useDarkmode();
    const [src, setSrc] = useState<string>(videoSrc);
    const [isPlaying, setIsPlaying] = useState<Boolean>(autoplay);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (darkModeVideoSrc && darkMode) {
            setSrc(darkModeVideoSrc);
        } else {
            setSrc(videoSrc);
        }
    }, [darkMode]);

    const toggleVideo = () => {
        if (isPlaying) {
            setIsPlaying(false);
            videoRef.current?.pause();
        } else {
            setIsPlaying(true);
            videoRef.current?.play();
        }
    };

    return (
        <div className={classnames(styles.videoOuter, isPlaying ? styles.isPaused : styles.isPlaying)}>
            <video ref={videoRef} src={src} autoPlay={autoplay} muted loop></video>

            {showPlayPauseButtons && (
                <span className={styles.buttonsOuter}>
                    <button className={classnames(styles.playButton, 'button-style-none')} onClick={toggleVideo}>
                        <Icon name="play" />
                    </button>

                    <button className={classnames(styles.pauseButton, 'button-style-none')} onClick={toggleVideo}>
                        <Icon name="pause" />
                    </button>
                </span>
            )}
        </div>
    );
};
