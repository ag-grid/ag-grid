import styles from '@design-system/modules/community-section/news-updates/Videos.module.scss';
import React, { useEffect, useRef, useState } from 'react';
import videos from '../../../content/community/news-updates/videos.json';


const Videos = () => {
    const carouselRef = useRef(null);

    const scroll = (direction) => {
      if (carouselRef.current) {
        const { scrollLeft, clientWidth } = carouselRef.current;
        const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
        carouselRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
      }
    };
  
    return (
        <div className={styles.videoCarouselContainer}>
            <button onClick={() => scroll('left')} className={styles.scrollButton + ' ' + styles.left}>‹</button>
            <div className={styles.carousel} ref={carouselRef}>
                {videos.map((video, index) => (
                    <div key={index} className={styles.videoItem}>
                    <iframe src={video.link} className={styles.video} />
                    <div className={styles.videoInfo}>
                        <h4 className={styles.title}>{video.title}</h4>
                        <p className={styles.author}>{video.author}</p>
                        <p className={styles.description}>{video.description}</p>
                    </div>
                    </div>
                ))}
            </div>
            <button onClick={() => scroll('right')} className={styles.scrollButton + ' ' + styles.right}>›</button>
      </div>
    );
};

export default Videos;
