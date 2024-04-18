import ScrollingGallery from '@ag-website-shared/components/community/components/events/ScrollingGallery';
import { useDarkmode } from '@utils/hooks/useDarkmode';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';

import styles from './Events.module.scss';

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
    return (
        <div className={styles.container}>
            <div className={styles.scrollingGalleryContainer}>
                <ScrollingGallery images={images} />
            </div>
            {upcomingEvents && (
                <>
                    <p className={styles.eventsSeparatorTitle}>Upcoming Events</p>
                    <div className={styles.eventsContainer}>
                        {upcomingEvents
                            .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
                            .map((event, index) => (
                                <EventItem key={index} event={event} />
                            ))}
                    </div>
                </>
            )}
            <p className={styles.eventsSeparatorTitle}>Past Events</p>
            <div className={styles.eventsContainer}>
                {pastEvents.map((event, index) => (
                    <EventItem key={index} event={event} />
                ))}
            </div>
        </div>
    );
};

export default Events;
