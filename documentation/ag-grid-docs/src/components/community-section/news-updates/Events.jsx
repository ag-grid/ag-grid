import React from 'react';
import styles from '@design-system/modules/community-section/news-updates/Events.module.scss';
import events from '../../../content/community/news-updates/events.json';

const ScrollingGallery = () => {
    return (
        <>
        </>
    )
}

const Events = () => {
    return (
        <div className={styles.container}>
            <div className={styles.scrollingGallery}>
                <ScrollingGallery />
            </div>
        </div>
    )
}

export default Events;