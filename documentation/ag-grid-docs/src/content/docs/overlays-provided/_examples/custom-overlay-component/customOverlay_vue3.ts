export default {
    template: `
    <div class="overlay-center">
      {{params.overlayType == 'loading' ? params.loadingMessage : (params.overlayType == 'noRows' ? params.noRowsMessage: "Default Message") }}
    </div>`,
};
