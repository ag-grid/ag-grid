import React, { useEffect, useRef } from 'react';
import images from './featured_event_images.json'; // Adjust the path as necessaryconst shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

const Gallery = ({ scrollDirection = 'left' }) => {
    const shuffledImages = shuffle(images);
    const scrollRef = useRef(null);
  let allowScroll = true; // Use a flag to control scrolling

  const scrollContent = () => {
    if (!scrollRef.current || !allowScroll) return;

    const { scrollLeft, clientWidth, scrollWidth } = scrollRef.current;
    let isAtEnd, isAtStart;

    if (scrollDirection === 'left') {
      isAtEnd = scrollLeft + clientWidth >= scrollWidth;
      isAtStart = scrollLeft === 0;
    } else {
      isAtEnd = scrollLeft === 0;
      isAtStart = scrollLeft + clientWidth >= scrollWidth;
    }

    if (isAtEnd) {
      // Reset to the opposite end when the end is reached
      const resetPosition = scrollDirection === 'left' ? 0 : scrollWidth - clientWidth;
      scrollRef.current.scrollTo({ left: resetPosition, behavior: 'auto' });
    } else {
      // Scroll in the specified direction
      const scrollIncrement = scrollDirection === 'left' ? 1 : -1;
      scrollRef.current.scrollTo({ left: scrollLeft + scrollIncrement, behavior: 'auto' });
    }
  };

  useEffect(() => {
    const interval = setInterval(scrollContent, 20); // Adjust interval for speed

    return () => clearInterval(interval);
  }, [scrollDirection]);

  // Optional: Use effect to monitor and adjust scrolling based on component's visibility or other conditions
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        allowScroll = false; // Pause scrolling when the tab is not visible
      } else {
        allowScroll = true; // Resume scrolling when the tab becomes visible
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return (
    <div
      ref={scrollRef}
      style={{
        display: 'flex',
        overflowX: 'auto',
        gap: '10px',
        width: '100%',
      }}
    >
      {shuffledImages.map((image, index) => (
        <img
          key={index}
          src={`../../../images/community/event-images/${image.src}`}
          alt={`Gallery item ${index}`}
          style={{ width: 100, height: 'auto', objectFit: 'cover' }} // Ensure 4 images are visible at minimum
        />
      ))}
    </div>
  );
};

export default Gallery;
