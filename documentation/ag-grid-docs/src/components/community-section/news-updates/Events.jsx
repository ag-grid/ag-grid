import { Icon } from '@components/icon/Icon';
import styles from '@design-system/modules/community-section/news-updates/Events.module.scss';
import { useDarkmode } from '@utils/hooks/useDarkmode';
import React, { useEffect, useRef, useState } from 'react';

import eventImages from '../../../content/community/news-updates/events-images.json';
import events from '../../../content/community/news-updates/events-new.json';

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const ScrollingGallery = () => {
    const scrollRef = useRef(null);
    useEffect(() => {
        const scrollContent = () => {
            if (!scrollRef.current) return;
            const { scrollLeft, clientWidth, scrollWidth } = scrollRef.current;
            const isAtEnd = scrollLeft + clientWidth >= scrollWidth;
            scrollRef.current.scrollTo({
                left: isAtEnd ? 0 : scrollLeft + 1,
                behavior: 'auto',
            });
        };

        const interval = setInterval(scrollContent, 20);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.blurContainer}>
            <div className={styles.scrollingGalleryContainer} ref={scrollRef}>
                {shuffleArray([...eventImages]).map((image, index) => (
                    <img
                        key={index}
                        src={`/community/events/${image.src}`}
                        alt={`Gallery item ${index}`}
                        className={styles.galleryImage}
                    />
                ))}
            </div>
        </div>
    );
};

const separateEventsByDate = (events) => {
    const upcomingEvents = [];
    const pastEvents = [];

    events.forEach((event) => {
        const startDate = new Date(event.startDate);
        if (startDate >= new Date()) {
            upcomingEvents.push(event);
        } else {
            pastEvents.push(event);
        }
    });

    return { upcomingEvents, pastEvents };
};

function extractUniqueYears(events) {
    const years = new Set();
    const currYear = new Date().getFullYear();
    events.forEach((event) => {
        const year = event.startDate.substring(0, 4);
        years.add(year);
    });
    return Array.from(years);
}

const Events = ({ enableFilters = false }) => {
    const [darkMode] = useDarkmode();
    const { upcomingEvents } = separateEventsByDate(events);
    const [currEvents, setCurrEvents] = useState(upcomingEvents);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const filterYears = (year) => {
        setSelectedYear(year);
        setCurrEvents(
            events.filter((event) => {
                const eventYear = new Date(event.startDate).getFullYear();
                return eventYear == year;
            })
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.eventDetailsContainer}>
                {enableFilters && (
                    <div className={styles.yearFiltersContainer}>
                        {extractUniqueYears(events).map((year, index) => (
                            <button
                                key={index}
                                className={`${styles.yearFilter} ${year == selectedYear ? styles.active : ''}`}
                                onClick={() => filterYears(year)}
                            >
                                {year}
                            </button>
                        ))}
                    </div>
                )}
                <ScrollingGallery />
                <div className={styles.eventTilesContainer}>
                    {currEvents.map((event, index) => (
                        <div key={index} className={styles.eventTile}>
                            <span className={styles.location}>
                                <Icon className={styles.locationIcon} name="mapPin" />
                                {event.location}
                            </span>
                            <span className={styles.conferenceIcon}></span>
                            <span className={styles.title}>{event.title}</span>
                            <span className={styles.description}>{event.description}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Events;
