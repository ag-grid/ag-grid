import styles from '@design-system/modules/community-section/EventsNew.module.scss';
import React, { useEffect, useRef, useState } from 'react';
import eventImages from '../../content/community/news-updates/events-images.json';
import events from '../../content/community/news-updates/events.json';

const EventItem = ({event}) => {
    return (
        <div>

        </div>
    )
}

const EventsNew = () => {
    const [showPastEvents, setShowPastEvents] = useState(false);
    return (
        <div className={styles.container}>
            <div className={styles.tabContainer}>
                <button className={styles.tabButton}>Upcoming Events</button>
                <button className={styles.tabButton}>Past Events</button>
            </div>
            <div className={styles.eventsContainer}>
                {}
            </div>
        </div>
    );
};

export default EventsNew;
