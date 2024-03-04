class MissionResultRenderer {
  eGui

  // Optional: Params for rendering. The same params that are passed to the cellRenderer function.
  init(params) {
    let icon = document.createElement("img")
    icon.src = `https://www.ag-grid.com/example-assets/icons/${
      params.value ? "tick-in-circle" : "cross-in-circle"
    }.png`
    icon.setAttribute("class", "missionIcon")

    this.eGui = document.createElement("span")
    this.eGui.setAttribute("class", "missionSpan")
    this.eGui.appendChild(icon)
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
