import React from 'react';

const EventLocations = () => {
  return (
    <div style={{ display: 'flex', height: 'auto', margin: 24}}>
      {/* Left Column for Buttons */}
      <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', padding: '10px' }}>
        <button style={{ flex: '1 1 auto', margin: '5px' }}>Button 1</button>
        <button style={{ flex: '1 1 auto', margin: '5px' }}>Button 2</button>
        <button style={{ flex: '1 1 auto', margin: '5px' }}>Button 3</button>
        {/* Add more buttons as needed */}
      </div>

      {/* Right Column for SVG */}
      <div style={{ flex: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src='../../../images/community/event-images/world.svg' style={{ width: 750, height: 'auto', objectFit: 'cover' }}/>
      </div>
    </div>
  );
};

export default EventLocations;