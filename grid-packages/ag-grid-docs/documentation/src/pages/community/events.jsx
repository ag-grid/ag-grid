import React from 'react';
import Gallery from './gallery';
import EventLocations from './event-locations';
import EventTabs from './event-tabs';


const Events = () => {
  return (
    <div className="events-container">
        {/* <div className="gallery-container">
            <Gallery scrollDirection='left'/>
            <div style={{marginTop: 10}}></div>
            <Gallery scrollDirection='right'/>
        </div> */}
        {/* <div className="map-container">
            <EventLocations />
        </div> */}
        <div className="map-container" style={{marginTop: 10}}>
            <EventTabs />
        </div>
    </div>
  );
};

export default Events;
