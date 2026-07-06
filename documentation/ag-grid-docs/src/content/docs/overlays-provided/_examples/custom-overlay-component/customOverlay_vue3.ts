export default {
    template: `
    <div class="overlay-center">
      {{params.overlayType == 'loading' ? params.loading.overlayText : (params.overlayType == 'noRows' ? params.noRows.overlayText: "Default Message") }}
    </div>`,
};
