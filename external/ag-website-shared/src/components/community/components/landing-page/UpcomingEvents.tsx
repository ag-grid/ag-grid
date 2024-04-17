import ScrollingGallery from '@ag-website-shared/components/community/components/events/ScrollingGallery';
import { Icon } from '@ag-website-shared/components/icon/Icon';
import { useDarkmode } from '@utils/hooks/useDarkmode';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';

import styles from './UpcomingEvents.module.scss';

const filterEvents = (events) => {
    const filteredEvents = events.filter(
        (event) => new Date(event.startDate).getFullYear() == new Date().getFullYear()
    );
    return filteredEvents.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
};

const UpcomingEvents = ({ images, events }) => {
    const [darkMode] = useDarkmode();
    const currEvents = filterEvents(events);

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
                <ScrollingGallery images={images} />
                <div className={styles.eventTilesContainer}>
                    {currEvents.map((event, index) => (
                        <a href={event.eventPage} target="_blank" className={styles.linkWrapper} key={index}>
                            <div key={index} className={styles.eventTile}>
                                <span className={styles.location}>
                                    <Icon className={styles.locationIcon} name="mapPin" />
                                    {event.location}
                                </span>
                                <span className={styles.conferenceIcon}>
                                    <img
                                        className={styles.organiserLogo}
                                        src={urlWithBaseUrl(darkMode ? event.logo : event.logoLight)}
                                        alt={`${event.logo}`}
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
