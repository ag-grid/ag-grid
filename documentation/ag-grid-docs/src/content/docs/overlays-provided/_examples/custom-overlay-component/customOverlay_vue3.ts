export default {
    template: `
    <div class="overlay-center" role="presentation">
      <div v-if="params.overlayType == 'loading'" role="presentation" style="height:100px; width:100px; background: url(https://www.ag-grid.com/images/ag-grid-loading-spinner.svg) center / contain no-repeat; margin: 0 auto"></div>
      <div aria-live="polite" aria-atomic="true">{{params.overlayType == 'loading' ? params.loadingMessage : params.noRowsMessage }}</div>
    </div>`,
};
