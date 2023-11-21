import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { AgGridReact } from 'ag-grid-react'; // React Grid Logic
import "ag-grid-community/styles/ag-grid.css"; // Core CSS
import "ag-grid-community/styles/ag-theme-quartz.css"; // Theme

// Custom Cell Renderer (Display flags based on cell value)
const CountryFlagCellRenderer = ({ value }) => (
  <span>{value && <img alt={`${value} Flag`} src={`https://www.ag-grid.com/example-assets/flags/${value.toLowerCase()}-flag-sm.png`} height={30} />}</span>
);

/* Format Date Cells */
const dateFormatter = (params) => {
  return new Date(params.value).toLocaleDateString("en-us", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Create new GridExample component
const GridExample = () => {
  // Row Data: The data to be displayed.
  const [rowData, setRowData] = useState([]);
  
  // Column Definitions: Defines & controls grid columns.
  const [colDefs] = useState([
    { 
      field: "mission", 
      resizable: true,
      checkboxSelection: true
    },
    { 
      field: "country", 
      cellRenderer: CountryFlagCellRenderer 
    },
    { field: "successful" },
    { 
      field: "date",
      valueFormatter: dateFormatter
    },
    { 
      field: "price",
      valueFormatter: params => { return '£' + params.value.toLocaleString(); } 
    },
    { field: "company" }
  ]);

  // Fetch data & update rowData state
  useEffect(() => {
    fetch('https://downloads.jamesswinton.com/space-mission-data.json')
      .then(result => result.json())
      .then(rowData => setRowData(rowData))
  }, [])

  // Apply settings across all columns
  const defaultColDefs = useMemo(() => ({
    resizable: true,
    editable: true
  }))

  // Container: Defines the grid's theme & dimensions.
  return (
    <div className={/** DARK MODE START **/document.documentElement.dataset.defaultTheme || 'ag-theme-quartz'/** DARK MODE END **/} style={{ width: '100%', height: '100%' }}>
      <AgGridReact 
        rowData={rowData}
        columnDefs={colDefs}
        defaultColDef={defaultColDefs}
        pagination={true}
        rowSelection='multiple'
        onSelectionChanged={event => console.log('Row Selected!')}
        onCellValueChanged={event => console.log(`New Cell Value: ${event.value}`)}
      />
    </div>
  );
}

// Render GridExample
const root = createRoot(document.getElementById("root"));
root.render(<GridExample />);