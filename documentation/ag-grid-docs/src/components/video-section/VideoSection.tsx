import { Icon } from '@ag-website-shared/components/icon/Icon';
import styles from '@legacy-design-system/modules/VideoSection.module.scss';
import classnames from 'classnames';
import { type ReactElement, useEffect, useState } from 'react';

interface Props {
    id: string;
    title: string;
    playlist: string;
    showHeader: boolean;
    children: ReactElement;
}

/**
 * This embeds a YouTube video into the page.
 */
export const VideoSection = ({ id, title, playlist, showHeader, children }: Props) => {
    const [hasWindow, setHasWindow] = useState(false);
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setHasWindow(true);
        }
    }, []);

    const link = `https://www.youtube.com/watch?v=${id}${playlist ? `&list=${playlist}` : ""}`;

    return (
        <>
            {hasWindow && (
                <div className={styles.videoSection}>
                    <div className={classnames({ [styles.header]: showHeader })}>
                        {children}
                    </div>
                    <a href={link} target='_blank'>
                        <div className={styles.ytContainer}>
                            <img
                                src={`https://img.youtube.com/vi/${id}/0.jpg`}
                                alt="Video thumbnail"
                                className={styles.ytThumbnail}
                            />
                            <Icon name="youtube" svgClasses={styles.ytIcon}/>
                        </div>
                    </a>
                </div>
            )}
        </>
    );
};
