// Grid API: Access to Grid API methods
let gridApi

class CompanyLogoRenderer {
  eGui

  // Optional: Params for rendering. The same params that are passed to the cellRenderer function.
  init(params) {
    let companyLogo = document.createElement("img")
    companyLogo.src = `https://www.ag-grid.com/example-assets/space-company-logos/${params.value.toLowerCase()}.png`
    companyLogo.setAttribute(
      "style",
      "display: block; width: 25px; height: auto; max-height: 50%; margin-right: 12px; filter: brightness(1.1)"
    )

    let companyName = document.createElement("p")
    companyName.textContent = params.value
    companyName.setAttribute(
      "style",
      "text-overflow: ellipsis; overflow: hidden; white-space: nowrap;"
    )

    this.eGui = document.createElement("span")
    this.eGui.setAttribute(
      "style",
      "display: flex; height: 100%; width: 100%; align-items: center"
    )
    this.eGui.appendChild(companyLogo)
    this.eGui.appendChild(companyName)
  }

  // Required: Return the DOM element of the component, this is what the grid puts into the cell
  getGui() {
    return this.eGui
  }

  // Required: Get the cell to refresh.
  refresh(params) {
    return false
  }
}

const gridOptions = {
  // Data to be displayed
  rowData: [],
  // Columns to be displayed (Should match rowData properties)
  columnDefs: [
    {
      field: "mission",
      filter: true,
    },
    {
      field: "company",
      cellRenderer: CompanyLogoRenderer,
    },
    { field: "location" },
    { field: "date" },
    {
      field: "price",
      valueFormatter: params => {
        return "£" + params.value.toLocaleString()
      },
    },
    { field: "successful" },
    { field: "rocket" },
  ],
  // Configurations applied to all columns
  defaultColDef: {
    filter: true,
  },
  // Grid Options & Callbacks
  pagination: true,
}

// Create Grid: Create new grid within the #myGrid div, using the Grid Options object
gridApi = agGrid.createGrid(document.querySelector("#myGrid"), gridOptions)

// Fetch Remote Data
fetch("https://www.ag-grid.com/example-assets/space-mission-data.json")
  .then(response => response.json())
  .then(data => gridApi.setGridOption("rowData", data))
