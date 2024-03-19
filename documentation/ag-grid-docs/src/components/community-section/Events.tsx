import ScrollingGallery from '@components/community-section/events/ScrollingGallery';
import styles from '@design-system/modules/CommunityEvents.module.scss';
import { useDarkmode } from '@utils/hooks/useDarkmode';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import { useState } from 'react';

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
        if (year != currYear) years.add(year);
    });
    return Array.from(years);
}

const EventItem = ({ event }) => {
    const [darkMode] = useDarkmode();
    return (
        <a href={event.eventPage ? event.eventPage : event.recording} target="_blank" className={styles.linkWrapper}>
            <div className={styles.eventItemContainer}>
                <div className={styles.eventItemLeftColumn}>
                    <div className={styles.titleContainer}>
                        <p className={styles.title}>{event.title}</p>
                        <p className={styles.date}>
                            {new Date(event.startDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </p>
                    </div>
                    <p className={styles.description}>{event.description}</p>
                    <div className={styles.footer}>
                        <div className={styles.locationContainer}>
                            {event.countryIcon ? (
                                <img
                                    className={styles.flag}
                                    src={urlWithBaseUrl(`/example-assets/flags/${event.countryIcon}`)}
                                    alt={`${event.countryIcon}`}
                                />
                            ) : (
                                ''
                            )}
                            <p className={styles.location}>{event.location}</p>
                        </div>
                        <div className={styles.ctaContainer}>
                            {event.eventPage && (
                                <p className={event.recording ? styles.secondaryCta : styles.primaryCta}>View Event</p>
                            )}
                            {event.recording && (
                                <p className={event.eventPage ? styles.primaryCta : styles.secondaryCta}>
                                    Watch Recording
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                <div className={styles.eventItemRightColumn}>
                    {event.collage ? (
                        <img
                            className={styles.eventImage}
                            src={urlWithBaseUrl(`/community/events/collages/${event.collage}`)}
                            alt={`${event.collage}`}
                        />
                    ) : (
                        <img
                            className={styles.eventLogo}
                            src={urlWithBaseUrl(darkMode || !event.logoLight ? event.logo : event.logoLight)}
                            alt={`${event.eventLogo}`}
                        />
                    )}
                </div>
            </div>
        </a>
    );
};

const Events = ({ images, events }) => {
    const { upcomingEvents, pastEvents } = separateEventsByDate(events);
    const [currEvents, setCurrEvents] = useState(upcomingEvents);
    const [activeTab, setActiveTab] = useState('upcoming');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() - 1);

    const handleTabClick = (tab) => {
        if (tab === 'upcoming') {
            setCurrEvents(upcomingEvents);
            setActiveTab('upcoming');
        } else {
            setCurrEvents(pastEvents);
            setActiveTab('past');
            setCurrEvents(
                events.filter((event) => {
                    const eventYear = new Date(event.startDate).getFullYear();
                    return eventYear == selectedYear;
                })
            );
        }
    };

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
            {activeTab == 'past' && (
                <div className={styles.filterContainer}>
                    {extractUniqueYears(events).map((year, index) => (
                        <button
                            key={index}
                            className={`${styles.tabButton} ${selectedYear == year ? styles.active : ''}`}
                            onClick={() => filterYears(year)}
                        >
                            {year}
                        </button>
                    ))}
                </div>
            )}
            {activeTab == 'upcoming' && (
                <div className={styles.scrollingGalleryContainer}>
                    <ScrollingGallery images={images} />
                </div>
            )}
            <div className={styles.eventsContainer}>
                {currEvents.map((event, index) => (
                    <EventItem key={index} event={event} />
                ))}
            </div>
        </div>
    );
};

export default Events;
