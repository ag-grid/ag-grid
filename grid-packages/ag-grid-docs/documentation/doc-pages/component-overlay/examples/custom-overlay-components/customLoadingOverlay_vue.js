export default {
  template: `
    <div class="ag-overlay-loading-center">
      <div style="height:100px; width:100px; background: url(https://ag-grid.com/images/ag-grid-loading-spinner.svg) center / contain no-repeat; margin: 0 auto" aria-label="loading"></div>
      <div>{{params.loadingMessage}}</div>
    </div>`,
}
