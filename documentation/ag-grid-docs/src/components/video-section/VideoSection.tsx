import styles from '@legacy-design-system/modules/VideoSection.module.scss';
import classnames from 'classnames';
import { type ReactElement, useEffect, useState } from 'react';

interface Props {
    id: string;
    title: string;
    showHeader: boolean;
    children: ReactElement;
}

/**
 * This embeds a YouTube video into the page.
 */
export const VideoSection = ({ id, title, showHeader, children }: Props) => {
    const [hasWindow, setHasWindow] = useState(false);
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setHasWindow(true);
        }
    }, []);

    return (
        <>
            {hasWindow && (
                <div className={styles.videoSection}>
                    <div className={classnames({ [styles.header]: showHeader })}>{children}</div>
                    <iframe
                        className={styles.ytIframe}
                        title={title}
                        src={`https://www.youtube-nocookie.com/embed/${id}`}
                        frameBorder="0"
                        modestbranding="1"
                        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            )}
        </>
    );
};
