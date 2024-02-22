import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { AgGridReact } from '@ag-grid-community/react'; // React Grid Logic
import "@ag-grid-community/styles/ag-grid.css"; // Core CSS
import "@ag-grid-community/styles/ag-theme-quartz.css"; // Theme

import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
ModuleRegistry.registerModules([ ClientSideRowModelModule ]);

// Custom Cell Renderer (Display logos based on cell value)
const CompanyLogoRenderer = ({ value }) => (
  <span style={{ display: "flex", height: "100%", width: "100%", alignItems: "center" }}>
    {value && <img alt={`${value} Flag`} src={`https://www.ag-grid.com/example-assets/space-company-logos/${value.toLowerCase()}.png`} style={{display: "block", width: "25px", height: "auto", maxHeight: "50%", marginRight: "12px", filter: "brightness(1.1)"}} />}
  </span>
);

/* Custom Cell Renderer (Display tick / cross in 'Successful' column) */
const MissionResultRenderer = ({ value }) => (
  <span style={{ display: "flex", justifyContent: "center", height: "100%", alignItems: "center"}}>
    {<img alt={`${value}`} src={`https://www.ag-grid.com/example-assets/icons/${value ? 'tick-in-circle' : 'cross-in-circle'}.png`} style={{width: "auto", height: "auto"}} />}
  </span>
);

const CompanyRenderer = (params) => {
  let value = params.value;
  if (params.value === 'Astra') {
    value = 'Astra_(American_spaceflight_company)'
  }
  return <a href={`https://en.wikipedia.org/wiki/${value}`} target="_blank">{params.value}</a>
}

const CustomButtonComponent = () => {
  return <button onClick={() => window.alert('Mission Launched') }>Launch!</button>;
};

// Create new GridExample component
const GridExample = () => {
  // Row Data: The data to be displayed.
  const [rowData, setRowData] = useState([]);
  
  // Column Definitions: Defines & controls grid columns.
  const [colDefs] = useState([
    {
      field: "company",
      valueGetter: (params) => {
        return params.data.company;
    },
      cellRenderer: CompanyRenderer
    },
    {
      headerName: "Logo",
      valueGetter: (params) => {
          return params.data.company;
      },
      cellRenderer: CompanyLogoRenderer 
    },
    {
      headerName: "Mission Cost",
      valueGetter: (params) => {
          return params.data.price;
      },
      // cellRenderer: PriceRenderer,
    },
    {
      field: "successful",
      headerName: "Success",
      cellRenderer: MissionResultRenderer 
    },
    {
      field: "button",
      headerName: "Button",
      cellRenderer: CustomButtonComponent,
    },
  ]);

  // Fetch data & update rowData state
  useEffect(() => {
    fetch('https://www.ag-grid.com/example-assets/small-space-mission-data.json')
      .then(result => result.json())
      .then(rowData => setRowData(rowData))
  }, [])

  // Container: Defines the grid's theme & dimensions.
  return (
    <div className={/** DARK MODE START **/document.documentElement.dataset.defaultTheme || 'ag-theme-quartz'/** DARK MODE END **/} style={{ width: '100%', height: '100%' }}>
      <AgGridReact 
        rowData={rowData}
        columnDefs={colDefs}
      />
    </div>
  );
}

// Render GridExample
const root = createRoot(document.getElementById("root"));
root.render(<GridExample />);