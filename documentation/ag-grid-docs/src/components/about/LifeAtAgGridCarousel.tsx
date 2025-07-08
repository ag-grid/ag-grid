import React, { useEffect, useRef } from 'react';

import styles from './LifeAtAgGridCarousel.module.scss';

const images = [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80',
];

export const LifeAtAgGridCarousel = () => {
    const trackRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;
        let animationFrame: number;
        let start: number | null = null;
        let scrollLeft = 0;
        const speed = 1.5; // px per ms (increased speed)

        const animate = (timestamp: number) => {
            if (start === null) start = timestamp;
            scrollLeft += speed;
            if (scrollLeft >= track.scrollWidth / 2) {
                scrollLeft = 0;
            }
            track.scrollLeft = scrollLeft;
            animationFrame = requestAnimationFrame(animate);
        };
        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, []);

    // Duplicate images for seamless looping
    const allImages = [...images, ...images];

    return (
        <div className={styles.lifeSectionWrapper}>
            <h2 className={styles.lifeHeading}>Life at AG Grid</h2>
            <p>
                We are headquartered in London, with a team of 60 professionals obsessed about building our products,
                bringing them to market and ensuring our customers are successful with them.
            </p>
            <div className={styles.carouselOuter}>
                <div className={styles.blurLeft} />
                <div className={styles.carouselTrack} ref={trackRef}>
                    {allImages.map((src, idx) => (
                        <div className={styles.carouselImageWrapper} key={idx}>
                            <img src={src} alt={`Life at AG Grid ${idx + 1}`} className={styles.carouselImage} />
                        </div>
                    ))}
                </div>
                <div className={styles.blurRight} />
            </div>
        </div>
    );
};

export default LifeAtAgGridCarousel;
