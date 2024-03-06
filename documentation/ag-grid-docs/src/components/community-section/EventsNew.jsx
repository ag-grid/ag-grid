import styles from '@design-system/modules/community-section/EventsNew.module.scss';
import React, { useEffect, useRef, useState } from 'react';

import eventImages from '../../content/community/news-updates/events-images.json';
import events from '../../content/community/news-updates/events-new.json';

const EventItem = ({ event }) => {
    return (
        <div className={styles.eventItemContainer}>
            <div className={styles.eventItemLeftColumn}>
                <div className={styles.titleContainer}>
                    <img className={styles.organiserLogo} src={`/community/events/organiser-logos/${event.organiserLogo}`} />
                    <p className={styles.title}>{event.title}</p>
                    <p className={styles.date}>{new Date(event.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <p className={styles.description}>{event.description}</p>
                <div className={styles.footer}>
                    <div className={styles.locationContainer}>
                        <img className={styles.flag} src={`/example-assets/flags/${event.countryIcon}`} />
                        <p className={styles.location}>{event.location}</p>
                    </div>
                    <div className={styles.ctaContainer}>
                        {event.eventPage && <a href={event.eventPage} target='_blank' className={event.recording ? styles.secondaryCta : styles.primaryCta}>View Event</a>}
                        {event.recording && <a href={event.recording} target='_blank' className={event.eventPage ? styles.primaryCta : styles.secondaryCta}>Watch Recording</a>}
                    </div>
                </div>
            </div>
            <div className={styles.eventItemRightColumn}>
                <img className={styles.eventImage} src={`/community/events/${event.coverImage}`} />
            </div>
        </div>
    );
};

const separateEventsByDate = (events) => {
    const today = new Date();
    const upcomingEvents = [];
    const pastEvents = [];

    events.forEach((event) => {
        const startDate = new Date(event.startDate);
        if (startDate >= today) {
            upcomingEvents.push(event);
        } else {
            pastEvents.push(event);
        }
    });

    return { upcomingEvents, pastEvents };
};

const years = [
    "2024", "2023", "2022"
]

const EventsNew = () => {
    const { upcomingEvents, pastEvents } = separateEventsByDate(events);
    const [currEvents, setCurrEvents] = useState(upcomingEvents);
    // Introduce a new state variable to track the active tab
    const [activeTab, setActiveTab] = useState('upcoming');

    const handleTabClick = (tab) => {
        if (tab === 'upcoming') {
            setCurrEvents(upcomingEvents);
            setActiveTab('upcoming');
        } else {
            setCurrEvents(pastEvents);
            setActiveTab('past');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.tabContainer}>
                <button
                    className={`${styles.tabButton} ${activeTab === 'upcoming' ? styles.active : ''}`}
                    onClick={() => handleTabClick('upcoming')}
                >
                    Upcoming Events
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'past' ? styles.active : ''}`}
                    onClick={() => handleTabClick('past')}
                >
                    Past Events
                </button>
            </div>
            <div className={styles.eventsContainer}>
                {currEvents.map((event, index) => (
                    <EventItem key={index} event={event} />
                ))}
            </div>
        </div>
    );
};

export default EventsNew;
