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
    centered?: boolean;
}

export const Video = ({
    videoSrc,
    darkModeVideoSrc,
    autoplay = true,
    showPlayPauseButtons = true,
    centered,
}: Props) => {
    const [darkMode] = useDarkmode();
    const [src, setSrc] = useState<string>(videoSrc);
    const [isPlaying, setIsPlaying] = useState<boolean>(autoplay);
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
        <div
            className={classnames(styles.videoOuter, {
                [styles.isPaused]: isPlaying,
                [styles.isPlaying]: !isPlaying,
                [styles.centered]: centered,
            })}
        >
            <video ref={videoRef} src={src} autoPlay={autoplay && isPlaying} muted loop></video>

            {showPlayPauseButtons && (
                <span className={styles.buttonsOuter}>
                    <button
                        className={classnames(styles.playButton, 'button-style-none')}
                        onClick={toggleVideo}
                        aria-label="Play video"
                    >
                        <Icon name="play" />
                    </button>

                    <button
                        className={classnames(styles.pauseButton, 'button-style-none')}
                        onClick={toggleVideo}
                        aria-label="Pause video"
                    >
                        <Icon name="pause" />
                    </button>
                </span>
            )}
        </div>
    );
};
