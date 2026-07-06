export default {
    template: `
    <div class="overlay-loading-center">
      <div aria-hidden="true" style="height:100px; width:100px; background: url(https://www.ag-grid.com/images/ag-grid-loading-spinner.svg) center / contain no-repeat; margin: 0 auto"></div>
      <div>{{params.loading.overlayText}}</div>
    </div>`,
};
