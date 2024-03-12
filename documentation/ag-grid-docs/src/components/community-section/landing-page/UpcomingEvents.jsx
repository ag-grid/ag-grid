import { Icon } from '@components/icon/Icon';
import styles from '@design-system/modules/CommunityUpcomingEvents.module.scss';
import { useDarkmode } from '@utils/hooks/useDarkmode';
import React, { useEffect, useRef, useState } from 'react';

import ScrollingGallery from '@components/community-section/events/ScrollingGallery';
import events from '../../../content/community/events.json';

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

const UpcomingEvents = ({ enableFilters = false }) => {
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

    // Function to format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);

        // Append 'st', 'nd', 'rd' or 'th' to the day number
        const day = date.getDate();
        let suffix = 'th';
        if (day % 10 === 1 && day !== 11) {
            suffix = 'st';
        } else if (day % 10 === 2 && day !== 12) {
            suffix = 'nd';
        } else if (day % 10 === 3 && day !== 13) {
            suffix = 'rd';
        }

        // Replace the numeric day with the day + suffix
        return formattedDate.replace(/(\d+)(,)/, `$1${suffix},`);
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
                        <a href={event.eventPage} target='_blank' className={styles.linkWrapper} key={index}>
                            <div key={index} className={styles.eventTile}>
                                <span className={styles.location}>
                                    <Icon className={styles.locationIcon} name="mapPin" />
                                    {event.location}
                                </span>
                                <span className={styles.conferenceIcon}>
                                    <img
                                        className={styles.organiserLogo}
                                        src={darkMode ? event.logo : event.logoLight}
                                    />
                                </span>
                                <span className={styles.title}>{event.title}</span>
                                <span className={styles.description}>{event.description}</span>
                                <span className={styles.date}>{formatDate(event.startDate)}</span>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UpcomingEvents;
