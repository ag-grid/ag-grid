import { Feature } from '.';

export const overlayFeature: Feature = {
  name: 'overlay',
  displayName: 'Overlay',
  commonVariablePrefix: '--ag-modal-overlay-',
  variableNames: ['--ag-modal-overlay-background-color'],
  gridOptions: {
    overlayLoadingTemplate:
      '<span aria-live="polite" aria-atomic="true" class="ag-overlay-loading-center">This is a overlay. Overlays are shown when data is loading or there are no rows in the loaded data set.</span>',
  },
  show(api) {
    api.showLoadingOverlay();
  },
  hide(api) {
    api.hideOverlay();
  },
};
