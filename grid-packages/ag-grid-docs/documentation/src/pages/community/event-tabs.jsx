import React, { useState } from 'react';
import Gallery from './gallery';
import eventData from './events.json';

const EventTabs = () => {
  const [activeTab, setActiveTab] = useState(new Date().getFullYear().toString());

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        {Object.keys(eventData).toReversed().map(tab => (
          <button
            key={tab}
            style={{
              marginRight: '10px',
              padding: '10px',
              background: activeTab === tab ? '#0e4491' : 'transparent',
              color: 'white',
              border: activeTab === tab ? 'none' : 'grey solid 1px',
              cursor: 'pointer',
            }}
            onClick={() => handleTabClick(tab)}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>
      <div>
            <div style={{marginBottom: 12}}><Gallery /></div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {eventData[activeTab].map((event, index) => (
            <>
          <div key={event.id} style={{ flex: '1', minWidth: '200px', padding: '20px', border: '1px solid grey', borderRadius: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3>{event.title}</h3>
            <p>{event.location}</p>
            <p>{event.description}</p>
          </div></>
        ))}
      </div>

      </div>
    </div>
  );
};

export default EventTabs;
