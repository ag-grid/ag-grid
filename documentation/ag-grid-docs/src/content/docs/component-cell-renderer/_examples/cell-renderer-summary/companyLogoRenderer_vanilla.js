class CompanyLogoRenderer {
  eGui

  // Optional: Params for rendering. The same params that are passed to the cellRenderer function.
  init(params) {
    let companyLogo = document.createElement("img")
    companyLogo.src = `https://www.ag-grid.com/example-assets/space-company-logos/${params.value.toLowerCase()}.png`
    companyLogo.setAttribute("class", "logo")

    this.eGui = document.createElement("span")
    this.eGui.setAttribute("class", "imgSpan")
    this.eGui.appendChild(companyLogo)
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
