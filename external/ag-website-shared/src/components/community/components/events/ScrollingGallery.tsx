import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import { useEffect, useRef, useState } from 'react';

import styles from './ScrollingGallery.module.scss';

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const ScrollingGallery = ({ images }) => {
    const [shuffledImages, setShuffedImages] = useState(images);
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

        const interval = setInterval(scrollContent, 10);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setShuffedImages(shuffleArray([...images]));
    }, [images]);

    return (
        <div className={styles.blurContainer}>
            <div className={styles.scrollingGalleryContainer} ref={scrollRef}>
                {shuffledImages.map((image, index) => (
                    <img
                        key={image.src}
                        src={urlWithBaseUrl(`/community/events/${image.src}`)}
                        alt={`Gallery item ${index}`}
                        className={styles.galleryImage}
                    />
                ))}
            </div>
        </div>
    );
};

export default ScrollingGallery;
