import React, { useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import podcastData from './podcasts.json';
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, import once
import 'ag-grid-community/styles/ag-theme-quartz.css'; // Theme CSS

const PodcastPlayerRenderer = (props) => {
    // The audio source URL is passed through the `value` prop by AG Grid.
    const audioSrc = props.value;
  
    return (
      <audio controls src={audioSrc} style={{ width: '100%' }}>
        Your browser does not support the audio element.
      </audio>
    );
};

const PodcastGrid = () => {
  const [columnDefs] = useState([
    { field: 'title', headerName: 'Podcast Title' },
    { field: 'description', headerName: 'Description' },
    { 
      field: 'link', 
      headerName: 'Listen', 
      cellRenderer: PodcastPlayerRenderer, 
      autoHeight: true, 
      cellStyle: {'padding': '10px'} 
    },
    { field: 'guests' },
    { field: 'published' },
  ]);

  const defaultColDef = {
    resizable: true,
    sortable: true,
    filter: true,
  };

  return (
    <div className="ag-theme-quartz-dark" style={{ height: 400, width: '100%' }}>
      <AgGridReact
        rowData={podcastData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
      />
    </div>
  );
};

export default PodcastGrid;