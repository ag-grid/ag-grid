export const variableDescriptionsFixture = {
  // this is dev fixture data, does not need updating if docs change
  '--ag-active-color':
    'Accent colour used for UI elements that need to stand out, such as form controls, range selections and focussed elements',
  // this is dev fixture data, does not need updating if docs change
  '--ag-material-primary-color':
    '(Material theme only) the primary colour as defined in the [Material Design colour system](https://material.io/design/color/). Currently this is used on buttons, range selections and selected tab underlines in the Material theme',
  // this is dev fixture data, does not need updating if docs change
  '--ag-foreground-color': 'Colour of text and icons in primary UI elements like menus',
  // this is dev fixture data, does not need updating if docs change
  '--ag-background-color': 'Background colour of the grid',
  // this is dev fixture data, does not need updating if docs change
  '--ag-secondary-foreground-color':
    'Colour of text and icons in UI elements that need to be slightly less emphasised to avoid distracting attention from data',
  // this is dev fixture data, does not need updating if docs change
  '--ag-data-color': 'Colour of text in grid cells',
  // this is dev fixture data, does not need updating if docs change
  '--ag-header-foreground-color': 'Colour of text and icons in the header',
  // this is dev fixture data, does not need updating if docs change
  '--ag-header-background-color':
    'Background colour for all headers, including the grid header, panels etc',
  // this is dev fixture data, does not need updating if docs change
  '--ag-tooltip-background-color': 'Background colour for all tooltips',
  // this is dev fixture data, does not need updating if docs change
  '--ag-disabled-foreground-color':
    "Color of elements that can't be interacted with because they are in a disabled state",
  // this is dev fixture data, does not need updating if docs change
  '--ag-subheader-background-color':
    'Background colour for second level headings within UI components',
  // this is dev fixture data, does not need updating if docs change
  '--ag-subheader-toolbar-background-color':
    'Background colour for toolbars directly under subheadings (as used in the chart settings menu)',
  // this is dev fixture data, does not need updating if docs change
  '--ag-control-panel-background-color':
    'Background for areas of the interface that contain UI controls, like tool panels and the chart settings menu',
  // this is dev fixture data, does not need updating if docs change
  '--ag-side-button-selected-background-color':
    'Background for the active tab on the side of the control panel',
  // this is dev fixture data, does not need updating if docs change
  '--ag-selected-row-background-color':
    'Background color of selected rows in the grid and in dropdown menus',
  // this is dev fixture data, does not need updating if docs change
  '--ag-odd-row-background-color': 'Background colour applied to every other row',
  // this is dev fixture data, does not need updating if docs change
  '--ag-modal-overlay-background-color':
    'Background color of the overlay shown over the grid e.g. a data loading indicator',
  // this is dev fixture data, does not need updating if docs change
  '--ag-row-hover-color':
    'Background color when hovering over rows in the grid and in dropdown menus. Set to `transparent` to disable the hover effect. Note: if you want a rollover on one but not the other, use CSS selectors instead of this property',
  // this is dev fixture data, does not need updating if docs change
  '--ag-column-hover-color': 'Background color when hovering over columns in the grid',
  // this is dev fixture data, does not need updating if docs change
  '--ag-range-selection-border-color': 'Color to draw around selected cell ranges',
  // this is dev fixture data, does not need updating if docs change
  '--ag-range-selection-border-style':
    'Border style for range selections, e.g. `solid` or `dashed`. Do not set to `none`, if you need to hide the border set the color to transparent',
  // this is dev fixture data, does not need updating if docs change
  '--ag-range-selection-background-color': 'Background colour of selected cell ranges.',
  // this is dev fixture data, does not need updating if docs change
  '--ag-range-selection-background-color-2':
    'Background-color when 2 selected ranges overlap. Hint: for a realistic appearance of multiple semi-transparent colours overlaying, set the opacity to 1-((1-X)^2) where X is the opacity of --ag-range-selection-background-color',
  // this is dev fixture data, does not need updating if docs change
  '--ag-range-selection-background-color-3':
    'Background-color when 3 selected ranges overlap. Hint: for a realistic appearance of multiple semi-transparent colours overlaying, set the opacity to 1-((1-X)^3) where X is the opacity of --ag-range-selection-background-color',
  // this is dev fixture data, does not need updating if docs change
  '--ag-range-selection-background-color-4':
    'Background-color when 4 or more selected ranges overlap. Hint: for a realistic appearance of multiple semi-transparent colours overlaying, set the opacity to 1-((1-X)^4) where X is the opacity of --ag-range-selection-background-color',
  // this is dev fixture data, does not need updating if docs change
  '--ag-range-selection-highlight-color':
    'Background colour to briefly apply to a cell range when it is copied from or pasted into',
  // this is dev fixture data, does not need updating if docs change
  '--ag-selected-tab-underline-color': 'Colour of the border drawn under selected tabs',
  // this is dev fixture data, does not need updating if docs change
  '--ag-selected-tab-underline-width': 'Thickness of the border drawn under selected tabs',
  // this is dev fixture data, does not need updating if docs change
  '--ag-selected-tab-underline-transition-speed':
    'Duration of animation used to show and hide the border drawn under selected tabs',
  // this is dev fixture data, does not need updating if docs change
  '--ag-range-selection-chart-category-background-color':
    'Background colour for cells that provide categories to the current range chart',
  // this is dev fixture data, does not need updating if docs change
  '--ag-range-selection-chart-background-color':
    'Background colour for cells that provide data to the current range chart',
  // this is dev fixture data, does not need updating if docs change
  '--ag-header-cell-hover-background-color':
    'Rollover colour for header cells. If you set this variable and have enabled column reordering by dragging, you may want to set `--ag-header-cell-moving-background-color` to ensure that the rollover colour remains in place during dragging.',
  // this is dev fixture data, does not need updating if docs change
  '--ag-header-cell-moving-background-color':
    'Colour applied to header cells when the column is being dragged to a new position',
  // this is dev fixture data, does not need updating if docs change
  '--ag-value-change-value-highlight-background-color':
    'Colour to apply when a cell value changes and enableCellChangeFlash is enabled',
  // this is dev fixture data, does not need updating if docs change
  '--ag-value-change-delta-up-color':
    'Colour to temporarily apply to cell data when its value increases in an agAnimateShowChangeCellRenderer cell',
  // this is dev fixture data, does not need updating if docs change
  '--ag-value-change-delta-down-color':
    'Colour to temporarily apply to cell data when its value decreases in an agAnimateShowChangeCellRenderer cell',
  // this is dev fixture data, does not need updating if docs change
  '--ag-chip-background-color':
    "Colour for the 'chip' that represents a column that has been dragged onto a drop zone",
  // this is dev fixture data, does not need updating if docs change
  '--ag-borders':
    'Enable or disable borders around most UI elements in the grid. Set this to a border style and thickness, e.g. `solid 1px` to enable borders, or `none` to disable borders. Use the other --ag-borders-* variables for more fine grained control over which UI elements get borders.',
  // this is dev fixture data, does not need updating if docs change
  '--ag-border-color':
    'Colour for border around major UI components like the grid itself, headers; footers and tool panels.',
  // this is dev fixture data, does not need updating if docs change
  '--ag-borders-critical':
    'Enable or disable borders that are critical to UX, e.g. those between headers and rows. Themes that disable borders generally may want to enable these borders. Set this to a border style and thickness, e.g. `solid 1px` to enable borders, or `none` to disable borders.',
  // this is dev fixture data, does not need updating if docs change
  '--ag-borders-secondary':
    'Draw decorative borders separating UI elements within components. Set this to a border style and thickness, e.g. `solid 1px` to enable borders, or `none` to disable borders.',
  // this is dev fixture data, does not need updating if docs change
  '--ag-secondary-border-color':
    'Colour for borders used to separate elements within a major UI component',
  // this is dev fixture data, does not need updating if docs change
  '--ag-row-border-style':
    'Default border style for the grid rows. Set this to a border style, e.g. `solid`, `dotted`.',
  // this is dev fixture data, does not need updating if docs change
  '--ag-row-border-color':
    'Colour of the border between grid rows, or `transparent` to display no border',
  // this is dev fixture data, does not need updating if docs change
  '--ag-cell-horizontal-border':
    'Default border for cells. This can be used to specify the border-style and border-color properties e.g. `dashed red` but the border-width is fixed at 1px. Set to `solid transparent` to show no border.',
  // this is dev fixture data, does not need updating if docs change
  '--ag-borders-input':
    'Draw borders around inputs. Set this to a border style and thickness, e.g. `solid 1px` to enable borders, or `none` to disable borders.',
  // this is dev fixture data, does not need updating if docs change
  '--ag-input-border-color': 'Colour for borders around inputs, if enabled with --ag-borders-input',
  // this is dev fixture data, does not need updating if docs change
  '--ag-borders-input-invalid':
    'Draw borders around inputs when their content has failed validation. Set this to a border style and thickness, e.g. `solid 2px` to enable borders. Set to `none` to disable borders but ensure that you have added styles to differentiate invalid from valid inputs.',
  // this is dev fixture data, does not need updating if docs change
  '--ag-input-border-color-invalid':
    'The color for the border around invalid inputs, if enabled with --ag-borders-input-invalid',
  // this is dev fixture data, does not need updating if docs change
  '--ag-borders-side-button':
    'Draw borders around the vertical tabs on the side of the control panel. Set this to a border style and thickness, e.g. `solid 1px` to enable borders, or `none` to disable borders.',
  // this is dev fixture data, does not need updating if docs change
  '--ag-border-radius': 'Border radius applied to many elements such as dialogs and form widgets',
  // this is dev fixture data, does not need updating if docs change
  '--ag-invalid-color': 'The color applied to form elements in an invalid state',
  // this is dev fixture data, does not need updating if docs change
  '--ag-input-disabled-border-color': 'The border around disabled text inputs',
  // this is dev fixture data, does not need updating if docs change
  '--ag-input-disabled-background-color': 'The background colour of disabled text inputs',
  // this is dev fixture data, does not need updating if docs change
  '--ag-checkbox-background-color': 'the background of an checkbox',
  // this is dev fixture data, does not need updating if docs change
  '--ag-checkbox-border-radius': 'edge rounding a checkboxes',
  // this is dev fixture data, does not need updating if docs change
  '--ag-checkbox-checked-color':
    'color of the `checkbox-checked` icon that is shown in a checked checkbox',
  // this is dev fixture data, does not need updating if docs change
  '--ag-checkbox-unchecked-color':
    'color of the `checkbox-unchecked` icon that is shown in an unchecked checkbox',
  // this is dev fixture data, does not need updating if docs change
  '--ag-checkbox-indeterminate-color':
    'color of the `checkbox-indeterminate` icon that is shown in an indeterminate checkbox',
  // this is dev fixture data, does not need updating if docs change
  '--ag-toggle-button-border-width': 'size of the toggle button outer border',
  // this is dev fixture data, does not need updating if docs change
  '--ag-toggle-button-on-border-color':
    "colour of the toggle button outer border in its 'on' state",
  // this is dev fixture data, does not need updating if docs change
  '--ag-toggle-button-off-border-color':
    "colour of the toggle button's outer border in its 'off' state",
  // this is dev fixture data, does not need updating if docs change
  '--ag-toggle-button-on-background-color':
    "colour of the toggle button background in its 'on' state",
  // this is dev fixture data, does not need updating if docs change
  '--ag-toggle-button-off-background-color':
    "colour of the toggle button background in its 'off' state",
  // this is dev fixture data, does not need updating if docs change
  '--ag-toggle-button-switch-background-color':
    'colour of the toggle button switch (the bit that slides from left to right)',
  // this is dev fixture data, does not need updating if docs change
  '--ag-toggle-button-switch-border-color':
    'border colour of the toggle button switch (the bit that slides from left to right)',
  // this is dev fixture data, does not need updating if docs change
  '--ag-toggle-button-width': 'width of the whole toggle button component',
  // this is dev fixture data, does not need updating if docs change
  '--ag-toggle-button-height': 'height of the whole toggle button component',
  // this is dev fixture data, does not need updating if docs change
  '--ag-input-focus-box-shadow': 'box shadow around focussed inputs',
  // this is dev fixture data, does not need updating if docs change
  '--ag-input-focus-border-color':
    'Colour of the border around focussed inputs. Set to `var(--ag-input-border-color)` if you do not want to change the border colour on focus.',
  // this is dev fixture data, does not need updating if docs change
  '--ag-minichart-selected-chart-color': 'Color of border around selected chart style',
  // this is dev fixture data, does not need updating if docs change
  '--ag-minichart-selected-page-color': 'Color of dot representing selected page of chart styles',
  // this is dev fixture data, does not need updating if docs change
  '--ag-grid-size':
    'grid-size is the main control for affecting how tightly data and UI elements are packed together. All padding and spacing in the grid is defined as a multiple of grid-size, so increasing it will make most components larger by increasing their internal white space while leaving the size of text and icons unchanged.',
  // this is dev fixture data, does not need updating if docs change
  '--ag-icon-size': 'The size of square icons and icon-buttons',
  // this is dev fixture data, does not need updating if docs change
  '--ag-widget-container-horizontal-padding':
    'The horizontal padding of containers that contain stacked widgets, such as menus and tool panels',
  // this is dev fixture data, does not need updating if docs change
  '--ag-widget-container-vertical-padding':
    'The vertical padding of containers that contain stacked widgets, such as menus and tool panels',
  // this is dev fixture data, does not need updating if docs change
  '--ag-widget-horizontal-spacing':
    'The horizontal spacing between widgets in containers that contain horizontally stacked widgets such as the column groups header component.',
  // this is dev fixture data, does not need updating if docs change
  '--ag-widget-vertical-spacing':
    'The vertical spacing between widgets in containers that contain vertically stacked widgets',
  // this is dev fixture data, does not need updating if docs change
  '--ag-cell-horizontal-padding':
    'Horizontal padding for grid and header cells (vertical padding is not set explicitly, but inferred from row-height / header-height',
  // this is dev fixture data, does not need updating if docs change
  '--ag-cell-widget-spacing':
    'Horizontal spacing between widgets inside cells (e.g. row group expand buttons and row selection checkboxes)',
  // this is dev fixture data, does not need updating if docs change
  '--ag-row-height': 'Height of grid rows',
  // this is dev fixture data, does not need updating if docs change
  '--ag-header-height': 'Height of header rows',
  // this is dev fixture data, does not need updating if docs change
  '--ag-list-item-height':
    'Height of items in lists (example of lists are dropdown select inputs and column menu set filters)',
  // this is dev fixture data, does not need updating if docs change
  '--ag-header-column-separator-display':
    'Whether to display the header column separator - a vertical line that displays between every header cell',
  // this is dev fixture data, does not need updating if docs change
  '--ag-header-column-separator-height':
    'Height of the header column separator. Percentage values are relative to the header height.',
  // this is dev fixture data, does not need updating if docs change
  '--ag-header-column-separator-width': 'Width of the header column separator',
  // this is dev fixture data, does not need updating if docs change
  '--ag-header-column-separator-color': 'Colour of the header column separator',
  // this is dev fixture data, does not need updating if docs change
  '--ag-header-column-resize-handle-display':
    'Whether to show the header column resize handle - a vertical line that displays only between resizeable header columns, indicating where to drag in order to resize the column.',
  // this is dev fixture data, does not need updating if docs change
  '--ag-header-column-resize-handle-height':
    'Height of the header resize handle. Percentage values are relative to the header height.',
  // this is dev fixture data, does not need updating if docs change
  '--ag-header-column-resize-handle-width': 'Width of the header resize handle.',
  // this is dev fixture data, does not need updating if docs change
  '--ag-header-column-resize-handle-color': 'Colour of the header resize handle',
  // this is dev fixture data, does not need updating if docs change
  '--ag-column-select-indent-size':
    'How much to indent child columns in the column tool panel relative to their parent',
  // this is dev fixture data, does not need updating if docs change
  '--ag-set-filter-indent-size':
    'How much to indent child filter items in the Set Filter List relative to their parent',
  // this is dev fixture data, does not need updating if docs change
  '--ag-row-group-indent-size':
    'How much to indent child rows in the grid relative to their parent row',
  // this is dev fixture data, does not need updating if docs change
  '--ag-filter-tool-panel-group-indent':
    'How much to indent child columns in the filters tool panel relative to their parent',
  // this is dev fixture data, does not need updating if docs change
  '--ag-tab-min-width': 'Minimum width of a tabbed menu (usd in charts)',
  // this is dev fixture data, does not need updating if docs change
  '--ag-menu-min-width': 'Minimum width of a menu that is not tabbed',
  // this is dev fixture data, does not need updating if docs change
  '--ag-side-bar-panel-width':
    'Width of the sidebar that contains the columns and filters tool panels',
  // this is dev fixture data, does not need updating if docs change
  '--ag-font-family': 'Font family used for all text',
  // this is dev fixture data, does not need updating if docs change
  '--ag-font-size': 'Default font size for text in the grid',
  // this is dev fixture data, does not need updating if docs change
  '--ag-icon-font-family': 'The [icon font](/custom-icons/) used by the grid.',
  // this is dev fixture data, does not need updating if docs change
  '--ag-card-radius': 'cards are elements that float above the UI',
  // this is dev fixture data, does not need updating if docs change
  '--ag-card-shadow':
    'the default card shadow applies to simple cards like column drag indicators and text editors',
  // this is dev fixture data, does not need updating if docs change
  '--ag-popup-shadow':
    'override the shadow for popups - cards that contain complex UI, like menus and charts',
};
