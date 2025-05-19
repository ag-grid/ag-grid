import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import { useEffect, useRef, useState } from 'react';

import './ImageCarousel.scss';

const ImageCarousel = () => {
    const leftColumnRef = useRef(null);
    const rightColumnRef = useRef(null);
    const [scrollHeight, setScrollHeight] = useState(0);

    useEffect(() => {
        const leftColumn = leftColumnRef.current;
        const rightColumn = rightColumnRef.current;
        let animationId;

        const updateScrollHeight = () => {
            if (leftColumn) {
                setScrollHeight(leftColumn.scrollHeight / 2);
            }
        };

        const animate = () => {
            if (leftColumn && rightColumn) {
                leftColumn.scrollTop += 1;
                if (leftColumn.scrollTop >= scrollHeight) {
                    leftColumn.scrollTop = 0;
                }

                rightColumn.scrollTop -= 1;
                if (rightColumn.scrollTop <= 0) {
                    rightColumn.scrollTop = scrollHeight;
                }
            }
            animationId = requestAnimationFrame(animate);
        };

        updateScrollHeight();
        window.addEventListener('resize', updateScrollHeight);

        // Set initial scroll positions
        if (leftColumn && rightColumn && scrollHeight > 0) {
            leftColumn.scrollTop = 0;
            rightColumn.scrollTop = scrollHeight / 2;
        }

        animationId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', updateScrollHeight);
        };
    }, [scrollHeight]);

    const images = [
        'images/scroller-1.webp',
        'images/scroller-2.webp',
        'images/scroller-3.webp',
        'images/scroller-4.webp',
        'images/scroller-5.webp',
        'images/scroller-6.webp',
        'images/scroller-7.webp',
        'images/scroller-8.webp',
        'images/scroller-9.webp',
        'images/scroller-10.webp',
        'images/scroller-11.webp',
        'images/scroller-12.webp',
    ];

    // Create arrays with twice the length of the original images array
    const leftImages = [...images, ...images];
    const rightImages = [...images, ...images].reverse();

    return (
        <div className="carousel-container">
            <div className="carousel-column">
                <div ref={leftColumnRef} className="carousel-scroll scroll-down">
                    <div className="carousel-content">
                        {leftImages.map((src, index) => (
                            <div key={index} className="image-row">
                                <img
                                    src={urlWithBaseUrl(src)}
                                    alt={`Left Image ${index + 1}`}
                                    className="carousel-image"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="carousel-column">
                <div ref={rightColumnRef} className="carousel-scroll scroll-up">
                    <div className="carousel-content">
                        {rightImages.map((src, index) => (
                            <div key={index} className="image-row">
                                <img
                                    src={urlWithBaseUrl(src)}
                                    alt={`Right Image ${index + 1}`}
                                    className="carousel-image"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="gradient-overlay"></div>
        </div>
    );
};

export default ImageCarousel;
