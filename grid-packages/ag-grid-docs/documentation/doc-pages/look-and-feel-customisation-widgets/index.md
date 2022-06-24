---
title: "Customising Inputs & Widgets"
---

Style text inputs, checkboxes, toggle buttons and range sliders. 

TODO add content: add intro, code snippet, example, and list of relevant CSS variables

## Using or Overriding Browser Native Widget Styles

TODO description of why you'd want to use `ag-grid-no-native-widgets.css` and a demo




## Suppressing native widget styles

The default styles in `ag-grid.css` contain many CSS rules to implement the `--ag-checkbox-*` and `--ag-toggle-button-*` variables described above. If you want to use the browser's default UI or create your own then it's easier to start from a blank slate rather than attempting to override the default styles.

To achieve this, use the `ag-grid-no-native-widgets.css` CSS file instead of `ag-grid.css`.

Users of the Sass API can pass `suppress-native-widget-styling: true` to accomplish this.