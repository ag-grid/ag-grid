import ScrollingGallery from '@ag-website-shared/components/community/components/events/ScrollingGallery';
import { useDarkmode } from '@utils/hooks/useDarkmode';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';

import styles from './Events.module.scss';

type Event = {
    title: string;
    description: string;
    location: string;
    logo: string;
    logoLight: string;
    countryIcon: string;
    startDate: string;
    eventPage: string;
    recording: string;
    collage: string;
    eventLogo: string;
};

type Image = {
    src: string;
    alt: string;
};

const separateEventsByDate = (events: Event[]): { upcomingEvents: Event[]; pastEvents: Event[] } => {
    const upcomingEvents: Event[] = [];
    const pastEvents: Event[] = [];

    const now = new Date();

    events.forEach((event) => {
        const startDate = new Date(event.startDate);
        if (startDate >= now) {
            upcomingEvents.push(event);
        } else {
            pastEvents.push(event);
        }
    });

    return { upcomingEvents, pastEvents };
};

const EventItem = ({ event }: { event: Event }) => {
    const [darkMode] = useDarkmode();
    return (
        <div className={styles.linkWrapper}>
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
                                <a
                                    className={event.recording ? styles.secondaryCta : styles.primaryCta}
                                    href={event.eventPage}
                                    target="_blank"
                                >
                                    View Event
                                </a>
                            )}
                            {event.recording && (
                                <a
                                    href={event.recording}
                                    target="_blank"
                                    className={event.eventPage ? styles.primaryCta : styles.secondaryCta}
                                >
                                    Watch Recording
                                </a>
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
        </div>
    );
};

const Events = ({ images, events }: { images: Image[]; events: Event[] }) => {
    const { upcomingEvents, pastEvents } = separateEventsByDate(events);
    return (
        <div className={styles.container}>
            <div className={styles.scrollingGalleryContainer}>
                <ScrollingGallery images={images} />
            </div>
            <p className={styles.eventsSeparatorTitle}>Upcoming Events</p>
            <div className={styles.eventsContainer}>
                {upcomingEvents?.length > 0 ? (
                    upcomingEvents
                        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                        .map((event, index) => <EventItem key={index} event={event} />)
                ) : (
                    <p>
                        We're currently planning our {new Date().getFullYear()} events. Check back soon for more
                        information.
                    </p>
                )}
            </div>

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
