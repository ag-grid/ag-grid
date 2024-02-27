import React, { useState, useRef, useEffect } from 'react';
import styles from '@design-system/modules/community-section/news-updates/Events.module.scss';
import events from '../../../content/community/news-updates/events.json';
import eventImages from'../../../content/community/news-updates/events-images.json';


const ScrollingGallery = () => {
    const scrollRef = useRef(null);
    useEffect(() => {
      const scrollContent = () => {
        if (!scrollRef.current) return;
        const { scrollLeft, clientWidth, scrollWidth } = scrollRef.current;
        const isAtEnd = scrollLeft + clientWidth >= scrollWidth;
        scrollRef.current.scrollTo({
          // Reset to start if at the end, otherwise increment scroll position
          left: isAtEnd ? 0 : scrollLeft + 1,
          behavior: 'auto',
        });
      };
    
      const interval = setInterval(scrollContent, 20); // Adjust interval for speed
      return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.blurContainer}>
            <div className={styles.scrollingGalleryContainer} ref={scrollRef}>
                {eventImages.map((image, index) => (
                    <img          
                        key={index}
                        src={`/community/events/${image.src}`}
                        alt={`Gallery item ${index}`}
                        className={styles.galleryImage}
                    />
                ))}
            </div>
        </div>
    )
}

const Events = () => {
    const [selectedYear, setSelectedYear] = useState(() => {
        const keys = Object.keys(events);
        return keys[keys.length - 1];
    });

    const handleYearFilter = (year) => {
        setSelectedYear(year)
    }

    return (
        <div className={styles.container}>
            <ScrollingGallery />
            <div className={styles.eventDetailsContainer}>
                <div className={styles.yearFiltersContainer}>
                    {Object.keys(events).toReversed().map((year, index) => (
                        <button 
                            key={index}
                            className={`${styles.yearFilter} ${year === selectedYear ? styles.active : ''}`} 
                            onClick={() => handleYearFilter(year)}
                        >
                            {year}
                        </button>
                    ))}
                </div>
                <div className={styles.eventTilesContainer} >
                    {events[selectedYear].map((event, index) => (
                        <div key={index} className={styles.eventTile}>
                            <span className={styles.title}>{event.title}</span>
                            <span className={styles.location}>{event.location}</span>
                            <hr></hr>
                            <span className={styles.description}>{event.description}</span>
                    </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Events;