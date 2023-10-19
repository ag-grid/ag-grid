export default {
  template: `<div class="ag-overlay-loading-center">
               <object style="height:100px; width:100px" type="image/svg+xml" data="https://ag-grid.com/images/ag-grid-loading-spinner.svg" aria-label="loading"></object>
               <div>  {{params.loadingMessage}} </div>
            </div>`,
}
