export type ParamType =
    | 'color'
    | 'length'
    | 'border'
    | 'borderStyle'
    | 'shadow'
    | 'image'
    | 'fontFamily'
    | 'fontWeight'
    | 'display'
    | 'duration';

export const getParamType = (param: string): ParamType => {
    if (/Color$/.test(param)) return 'color';
    if (/(Padding|Spacing|Size|Width|Height|Radius|Indent|Scale)(Start|End|Top|Bottom|Horizontal|Vertical)?$/.test(param))
        return 'length';
    if (/Border$/.test(param)) return 'border';
    if (/BorderStyle$/.test(param)) return 'borderStyle';
    if (/Shadow$/.test(param)) return 'shadow';
    if (/Image$/.test(param)) return 'image';
    if (/[fF]ontFamily$/.test(param)) return 'fontFamily';
    if (/[fF]ontWeight$/.test(param)) return 'fontWeight';
    if (/Duration$/.test(param)) return 'duration';
    if (/Display$/.test(param)) return 'display';
    throw new Error(`Param "${param}" does not have a recognised suffix.`);
};


const docs: Record<string, string | undefined> = {
    backgroundColor:
        'Background colour of the grid. Many UI elements are semi-transparent, so their colour blends with the background colour.',
    foregroundColor:
        'Default colour for neutral UI elements. Most text, borders and backgrounds are defined as semi-transparent versions of this colour, resulting in a blend between the background and foreground colours.',
    textColor: 'Default colour for all text',
    accentColor:
        "The 'brand colour' for the grid, used wherever a non-neutral colour is required. Selections, focus outlines and checkboxes use the accent colour by default.",
    invalidColor: 'The colour for inputs and UI controls in an invalid state.',
    borderColor: 'Default colour for borders.',
    wrapperBorder: 'Borders around the outside of the grid',
    headerBorder: 'Borders between and below header rows.',
    rowBorder: 'Borders between rows.',
    footerBorder: 'Horizontal borders above footer components like the pagination and status bars',
    columnBorder: 'Vertical borders separating columns.',
    columnHeaderBorder: 'Vertical borders separating column headers.',
    columnHeaderBorderHeight:
        'Height of the border between column headers. Percentage values are relative to the header height.',
    pinnedColumnBorder: 'Borders between the grid and columns that are pinned to the left or right',
    pinnedRowBorder: 'Borders between the grid and rows that are pinned to the top or bottom',
    sidePanelBorder:
        'Borders between the grid and side panels including the column and filter tool bars, and chart settings',
    sideButtonSelectedBorder: 'Border around the selected sidebar button on the side panel',
    sideButtonSelectedBackgroundColor: 'Border around the selected sidebar button on the side panel',
    sideBarBackgroundColor:
        'Background colour for non-data areas of the grid. Headers, tool panels and menus use this colour by default.',
    fontFamily: 'Font family used for all text.',
    chromeBackgroundColor:
        'Background colour for non-data areas of the grid. Headers, tool panels and menus use this colour by default.',
    headerBackgroundColor: 'Background colour for header and header-like.',
    headerFontWeight: 'Weight of text in the header',
    headerFontFamily: 'Font of text in the header',
    headerFontSize: 'Size of text in the header',
    headerVerticalPaddingScale: 'Adjust header vertical padding by a proportion',
    headerTextColor: 'Colour of text in the header',
    headerCellHoverBackgroundColor: 'Rollover colour for header cells.',
    headerCellHoverBackgroundTransitionDuration:
        'Duration of header cell hover transition, if --ag-header-cell-hover-background-color is set.',
    dataColor: 'Colour of text in grid cells.',
    subtleTextColor: 'Colour of text and UI elements that should stand out less than the default.',
    rangeSelectionBorderStyle: 'Style of the border around range selections.',
    rangeSelectionBorderColor:
        'The color used for borders around range selections. The selection background defaults to a semi-transparent version of this colour.',
    rangeSelectionBackgroundColor:
        'Background colour of selected cell ranges. Choosing a semi-transparent colour ensure that multiple overlapping ranges look correct.',
    rangeSelectionChartBackgroundColor: 'Background colour for cells that provide data to the current range chart',
    rangeSelectionChartCategoryBackgroundColor:
        'Background colour for cells that provide categories to the current range chart',
    rangeSelectionHighlightColor:
        'Background colour to briefly apply to a cell range when the user copies from or pastes into it.',
    rowHoverColor:
        'Background color when hovering over rows in the grid and in dropdown menus. Set to `transparent` to disable the hover effect. Note: if you want a rollover on one but not the other, use CSS selectors instead of this property.',
    columnHoverColor:
        'Background color when hovering over columns in the grid. This is not visible unless enabled in the grid options.',
    selectedRowBackgroundColor: 'Background color of selected rows in the grid and in dropdown menus.',
    modalOverlayBackgroundColor: 'Background color of the overlay shown over the grid e.g. a data loading indicator.',
    oddRowBackgroundColor: 'Background colour applied to every other row',
    borderRadius: 'Default rounding for many UI elements such as menus, dialogs and form widgets.',
    wrapperBorderRadius: 'Rounding of the outermost container around the grid.',
    cellWidgetSpacing:
        'Horizontal spacing between widgets inside cells (e.g. row group expand buttons and row selection checkboxes).',
    labelWidgetSpacing: 'Horizontal spacing between icons and text inside labels, e.g. in the header and sidebar tabs',
    rowGroupIndentSize:
        'The indentation applied to each level of row grouping - deep rows are indented by a multiple of this value.',
    valueChangeDeltaUpColor:
        'Colour to temporarily apply to cell data when its value increases in an agAnimateShowChangeCellRenderer cell',
    valueChangeDeltaDownColor:
        'Colour to temporarily apply to cell data when its value decreases in an agAnimateShowChangeCellRenderer cell',
    valueChangeValueHighlightBackgroundColor:
        'Colour to apply when a cell value changes and enableCellChangeFlash is enabled',
    gridSize:
        'Spacing around and inside UI elements. All padding and margins in the grid are defined as a multiple of this value.',
    cellHorizontalPadding: 'Colour to apply when a cell value changes and enableCellChangeFlash is enabled',
    cellHorizontalPaddingScale: 'Adjust cell horizontal padding by a proportion',
    fontSize: 'Height of grid rows',
    rowHeight: 'Height of grid rows',
    rowVerticalPaddingScale: 'Adjust row vertical padding by a proportion',
    headerHeight: 'Height of header rows',
    popupShadow: 'Default shadow for elements that float above the grid e.g. dialogs and menus',
    dropdownShadow: 'Default shadow for dropdown menus',
    dragGhostBackgroundColor: 'Background colour of the ghost element when dragging columns',
    dragGhostBorder: 'Border colour of the ghost element when dragging columns',
    dragGhostShadow: 'Shadow for the ghost element when dragging columns',
    focusShadow:
        'Shadow around UI controls that have focus e.g. text inputs and buttons. The value must a valid CSS box-shadow.',
    sideBarPanelWidth: 'Default width of the sidebar that contains the columns and filters tool panels',
    headerColumnResizeHandleDisplay:
        'Whether to show an indicator of the drag handle on resizable header columns. If hidden, the handle will still be active but invisible.',
    headerColumnResizeHandleHeight:
        'Height of the drag handle on resizable header columns. Percentage values are relative to the header height.',
    headerColumnResizeHandleWidth: 'Width of the drag handle on resizable header columns.',
    headerColumnResizeHandleColor: 'Colour of the drag handle on resizable header columns',
    widgetContainerHorizontalPadding:
        'The horizontal padding of containers that contain stacked widgets, such as menus and tool panels',
    widgetContainerVerticalPadding:
        'The vertical padding of containers that contain stacked widgets, such as menus and tool panels',
    widgetHorizontalSpacing: 'The spacing between widgets in containers arrange widgets horizontally',
    widgetVerticalSpacing: 'The spacing between widgets in containers arrange widgets vertically',
    listItemHeight: 'Height of items in scrolling lists e.g. dropdown select inputs and column menu set filters.',
    toggleButtonWidth: 'Width of the whole toggle button component',
    toggleButtonHeight: 'Height of the whole toggle button component',
    toggleButtonBorderWidth: 'Size of the toggle button outer border',
    toggleButtonOnBorderColor: "Colour of the toggle button outer border in its 'on' state",
    toggleButtonOnBackgroundColor: "Colour of the toggle button background in its 'on' state",
    toggleButtonOffBorderColor: "Colour of the toggle button's outer border in its 'off' state",
    toggleButtonOffBackgroundColor: "Colour of the toggle button background in its 'off' state",
    toggleButtonSwitchBorderColor: 'Border colour of the toggle button switch (the bit that slides from left to right)',
    toggleButtonSwitchBackgroundColor: 'Colour of the toggle button switch (the bit that slides from left to right)',
    checkboxBorderWidth: 'The color of an unchecked checkbox',
    checkboxBorderRadius: 'The color of an unchecked checkbox',
    checkboxUncheckedBackgroundColor: 'The inner color of an unchecked checkbox',
    checkboxUncheckedBorderColor: 'The border color of an unchecked checkbox',
    checkboxCheckedBackgroundColor: 'The inner color of a checked checkbox',
    checkboxCheckedBorderColor: 'The border color of a checked checkbox',
    checkboxCheckedShapeImage: 'An image defining the shape of the check mark on checked checkboxes',
    checkboxCheckedShapeColor: 'The colour of the check mark on checked checkboxes.',
    checkboxIndeterminateBackgroundColor: 'The inner color of an indeterminate checkbox',
    checkboxIndeterminateBorderColor: 'The border color of an indeterminate checkbox',
    checkboxIndeterminateShapeImage: 'An image defining the shape of the dash mark on indeterminate checkboxes',
    checkboxIndeterminateShapeColor: 'The colour of the dash mark on indeterminate checkboxes',
    radioCheckedShapeImage: 'An image defining the shape of the mark on checked radio buttons',
    menuBorder: 'Border around menus e.g. column menu and right-click context menu',
    menuBackgroundColor: 'Background colour for menus e.g. column menu and right-click context menu',
    menuTextColor: 'Text colour for menus e.g. column menu and right-click context menu',
    menuShadow: 'Shadow for menus e.g. column menu and right-click context menu',
    menuSeparatorColor:
        'Colour of the dividing line between sections of menus e.g. column menu and right-click context menu',
    setFilterIndentSize: 'How much to indent child items in the Set Filter list when filtering tree data.',
    chartMenuButtonBorder: 'Border around the button that shows and hides the chart settings menus',
    iconButtonHoverColor: 'Hover color for clickable icons',
    dialogShadow: 'Shadow for popup dialogs such as the integrated charts and the advanced filter builder.',
    dialogBorder: 'Border colour popup dialogs such as the integrated charts and the advanced filter builder.',
    panelBackgroundColor:
        'Background colour for panels and dialogs such as the integrated charts and the advanced filter builder.',
    panelTitleBarBackgroundColor:
        'Background colour for the title bar of panels and dialogs such as the integrated charts and the advanced filter builder.',
    panelTitleBarBorder:
        'Border below the title bar of panels and dialogs such as the integrated charts and the advanced filter builder.',
    columnSelectIndentSize: 'How much to indent child items in the Set Filter list when filtering tree data.',
    toolPanelSeparatorBorder:
        'Colour of the dividing line between sections of menus e.g. column menu and right-click context menu',
    tooltipBackgroundColor: 'Background colour for tooltips',
    tooltipTextColor: 'Text colour for tooltips',
    tooltipBorder: 'Border for tooltips',
    columnDropCellBackgroundColor:
        'Background colour for the representation of columns within the column drop component',
    columnDropCellBorder: 'Border for the representation of columns within the column drop component',
    advancedFilterBuilderButtonBarBorder:
        'Colour of the dividing line above the buttons in the advanced filter builder',
    advancedFilterBuilderIndentSize:
        'Amount that each level of the nesting in the advanced filter builder is indented by',
    advancedFilterBuilderJoinPillColor: 'Colour of the join operator pills in the Advanced Filter Builder',
    advancedFilterBuilderColumnPillColor: 'Colour of the column pills in the Advanced Filter Builder',
    advancedFilterBuilderOptionPillColor: 'Colour of the filter option pills in the Advanced Filter Builder',
    advancedFilterBuilderValuePillColor: 'Colour of the value pills in the Advanced Filter Builder',
    filterToolPanelGroupIndent: 'How much to indent child columns in the filters tool panel relative to their parent',
    iconButtonHoverBackgroundColor: 'Background color of clickable icons when hovered',
    iconSize: 'The size of square icons and icon-buttons',

    primaryColor:
        'Application primary colour as defined to the Material Design specification. Only used by Material theme parts.',

    //
    // TABS
    //
    tabBarBackgroundColor: 'Background color of the container for tabs',
    tabBarBorder: 'Border below the container for tabs',
    tabBarTopPadding: 'Padding at the top of the container for tabs',
    tabBarHorizontalPadding: 'Padding at the left and right of the container for tabs',

    tabBackgroundColor: 'Background color of tabs',
    tabTextColor: 'Color of text within tabs',
    tabSpacing: 'Gap between tabs',
    tabHorizontalPadding: 'Padding inside the top and bottom sides of the container for tabs',
    tabTopPadding: 'Padding at the top of the container for tabs',
    tabBottomPadding: 'Padding at the bottom of the container for tabs',

    tabHoverBackgroundColor: 'Background color of tabs when hovered over',
    tabHoverTextColor: 'Color of text within tabs when hovered over',

    tabSelectedTextColor: 'Color of text within the selected tabs',
    tabSelectedBackgroundColor: 'Background color of selected tabs',
    tabSelectedBorderWidth: 'Color of the border around selected tabs',
    tabSelectedBorderColor: 'Color of the border around selected tabs',
    tabSelectedUnderlineColor: 'Color of line drawn under selected tabs',
    tabSelectedUnderlineWidth: 'Width of line drawn under selected tabs',
    tabSelectedUnderlineTransitionDuration: 'The time that the line drawn under selected tabs takes to fade in and out',

    //
    // INPUTS
    //
    inputBackgroundColor: 'Background color for text inputs',
    inputBorder:
        'Border around text inputs. By default the border is drawn all around the input, when using Material Design inputs the border is drawn underneath',
    inputBorderRadius: 'Corner radius of the border around text inputs',
    inputTextColor: 'Color of text within text inputs',
    inputPaddingStart: 'Padding before text in text inputs',
    inputHeight: 'Minimum height of text inputs',
    inputFocusBackgroundColor: 'Background color for focussed text inputs',
    inputFocusBorder:
        'Border around focussed text inputs. By default the border is drawn all around the input, when using Material Design inputs the border is drawn underneath',
    inputFocusShadow: 'Shadow around focussed text inputs',
    inputFocusTextColor: 'Color of text within focussed text inputs',
    inputDisabledBackgroundColor: 'Background color for disabled text inputs',
    inputDisabledBorder:
        'Border around disabled text inputs. By default the border is drawn all around the input, when using Material Design inputs the border is drawn underneath',
    inputDisabledTextColor: 'Color of text within disabled text inputs',
    inputInvalidBackgroundColor: 'Background color for text inputs in an invalid state',
    inputInvalidBorder:
        'Border around text inputs in an invalid state. By default the border is drawn all around the input, when using Material Design inputs the border is drawn underneath',
    inputInvalidTextColor: 'Color of text within text inputs in an invalid state',
};

export const getParamDocs = (param: string): string | undefined => {
    return docs[param];
};

export const getParamDocsKeys = () => Object.keys(docs);
