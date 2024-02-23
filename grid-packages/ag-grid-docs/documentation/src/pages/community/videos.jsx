import React, { useState } from 'react';
import videoData from './videos.json';
import './videos.css'

const VideoCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Function to chunk the video data into groups of 4
  const chunkedVideoData = videoData.reduce((resultArray, item, index) => { 
    const chunkIndex = Math.floor(index / 4);

    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = []; // start a new chunk
    }

    resultArray[chunkIndex].push(item);

    return resultArray;
  }, []);

  const goToPrevious = () => {
    const isFirstPage = currentIndex === 0;
    const newIndex = isFirstPage ? chunkedVideoData.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastPage = currentIndex === chunkedVideoData.length - 1;
    const newIndex = isLastPage ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  return (
    <div>
      <div>
        <button onClick={goToPrevious}>Previous</button>
        <button onClick={goToNext}>Next</button>
      </div>
      <div className="video-row">
        {chunkedVideoData.length > 0 && chunkedVideoData[currentIndex].map((video, index) => (
          <div key={index} className="video-card">
            <iframe width="100%" height="200" src={video.link} />
            <h3>{video.title}</h3>
            <p>{video.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoCarousel;