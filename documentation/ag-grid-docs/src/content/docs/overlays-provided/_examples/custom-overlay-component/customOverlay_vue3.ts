export default {
    template: `
    <div class="overlay-center" role="presentation">
      <div aria-live="polite" aria-atomic="true">{{params.overlayType == 'loading' ? params.loadingMessage : (params.overlayType == 'noRows' ? params.noRowsMessage: "Default Message") }}</div>
    </div>`,
};
