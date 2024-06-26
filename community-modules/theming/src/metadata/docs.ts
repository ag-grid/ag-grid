const docs: Record<string, string | undefined> = {
    backgroundColor:
        'Background colour of the grid. Many UI elements are semi-transparent, so their colour blends with the background colour.',
    foregroundColor:
        'Default colour for neutral UI elements. Most text, borders and backgrounds are defined as semi-transparent versions of this colour, resulting in a blend between the background and foreground colours.',
    textColor: 'Default colour for all text',
    accentColor:
        "The 'brand colour' for the grid, used wherever a non-neutral colour is required. Selections, focus outlines and checkboxes use the accent colour by default.",
    invalidColor: 'The colour for inputs and UI controls in an invalid state.',
    colorScheme: 'The colour scheme to apply to browser scrollbars within the grid',
    borderColor: 'Default colour for borders.',
    wrapperBorder: 'Borders around the outside of the grid',
    headerRowBorder: 'Borders between and below header rows.',
    rowBorder: 'Horizontal borders between rows.',
    footerRowBorder: 'Horizontal borders above footer components like the pagination and status bars',
    columnBorder: 'Vertical borders between columns.',
    headerColumnBorder: 'Vertical borders between column headers.',
    headerColumnBorderHeight:
        'Height of the vertical border between column headers. Percentage values are relative to the header height.',
    pinnedColumnBorder:
        'Vertical borders between columns that are pinned to the left or right and the rest of the grid',
    pinnedRowBorder:
        'Horizontal borders between the grid and rows that are pinned to the top or bottom and the rest of the grid',
    sidePanelBorder:
        'Borders between the grid and side panels including the column and filter tool bars, and chart settings',
    sideButtonSelectedBorder: 'Border around the selected sidebar button on the side panel',
    sideButtonSelectedBackgroundColor: 'Background colour of the selected sidebar button on the side panel',
    sideBarBackgroundColor:
        'Background colour for non-data areas of the grid. Headers, tool panels and menus use this colour by default.',
    fontFamily: 'Font family used for all text.',
    chromeBackgroundColor:
        'Background colour for non-data areas of the grid. Headers, tool panels and menus use this colour by default.',
    headerBackgroundColor: 'Background colour for header and header-like.',
    headerFontWeight: 'Font weight of text in the header',
    headerFontFamily: 'Font family of text in the header',
    headerFontSize: 'Size of text in the header',
    headerVerticalPaddingScale: 'Multiply the header vertical padding by a number, e.g. 1.5 to increase by 50%',
    headerTextColor: 'Colour of text in the header',
    headerCellHoverBackgroundColor: 'Background colour when hovering over header cells.',
    headerCellHoverBackgroundTransitionDuration:
        'Duration of header cell hover transition, if headerCellHoverBackgroundColor is set.',
    cellTextColor: 'Colour of text in grid cells.',
    subtleTextColor: 'Colour of text and UI elements that should stand out less than the default.',
    rangeSelectionBorderStyle: 'Border style around range selections.',
    rangeSelectionBorderColor:
        'The colour used for borders around range selections. The selection background defaults to a semi-transparent version of this colour.',
    rangeSelectionBackgroundColor:
        'Background colour of selected cell ranges. Choosing a semi-transparent colour ensure that multiple overlapping ranges look correct.',
    rangeSelectionChartBackgroundColor: 'Background colour for cells that provide data to the current range chart',
    rangeSelectionChartCategoryBackgroundColor:
        'Background colour for cells that provide categories to the current range chart',
    rangeSelectionHighlightColor:
        'Background colour to briefly apply to a cell range when the user copies from or pastes into it.',
    rowHoverColor:
        'Background colour when hovering over rows in the grid and in dropdown menus. Set to `transparent` to disable the hover effect. Note: if you want a hover effect on one but not the other, use CSS selectors instead of this property.',
    columnHoverColor:
        'Background colour when hovering over columns in the grid. This is not visible unless enabled in the grid options.',
    selectedRowBackgroundColor: 'Background colour of selected rows in the grid and in dropdown menus.',
    modalOverlayBackgroundColor: 'Background colour of the overlay shown over the grid e.g. a data loading indicator.',
    oddRowBackgroundColor: 'Background colour applied to every other row',
    borderRadius: 'Default corner radius for many UI elements such as menus, dialogs and form widgets.',
    wrapperBorderRadius: 'Corner radius of the outermost container around the grid.',
    cellWidgetSpacing:
        'Horizontal spacing between widgets inside cells (e.g. row group expand buttons and row selection checkboxes).',
    rowGroupIndentSize:
        'The size of indentation applied to each level of row grouping - deep rows are indented by a multiple of this value.',
    valueChangeDeltaUpColor:
        'Colour to temporarily apply to cell data when its value increases in an agAnimateShowChangeCellRenderer cell',
    valueChangeDeltaDownColor:
        'Colour to temporarily apply to cell data when its value decreases in an agAnimateShowChangeCellRenderer cell',
    valueChangeValueHighlightBackgroundColor:
        'Background colour to apply when a cell value changes and enableCellChangeFlash is enabled',
    gridSize:
        'Amount of spacing around and inside UI elements. All padding and margins in the grid are defined as a multiple of this value.',
    cellHorizontalPadding: 'Padding at the start and end of grid cells and header cells.',
    cellHorizontalPaddingScale: 'Multiply the cell horizontal padding by a number, e.g. 1.5 to increase by 50%',
    fontSize: 'Default font size for text in the grid',
    rowHeight: 'Height of grid rows',
    rowVerticalPaddingScale:
        'Multiply the row vertical padding by a number, e.g. 1.5 to increase by 50%. If rowHeight is set, the amount of padding is fixed and so this will have no effect.',
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
        'Whether to display an indicator of the drag handle on resizable header columns. If hidden, the handle will still be active but invisible.',
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
    toggleButtonBorderWidth: 'Width of the toggle button outer border',
    toggleButtonOnBorderColor: "Colour of the toggle button outer border in its 'on' state",
    toggleButtonOnBackgroundColor: "Colour of the toggle button background in its 'on' state",
    toggleButtonOffBorderColor: "Colour of the toggle button's outer border in its 'off' state",
    toggleButtonOffBackgroundColor: "Colour of the toggle button background in its 'off' state",
    toggleButtonSwitchBorderColor: 'Border colour of the toggle button switch (the bit that slides from left to right)',
    toggleButtonSwitchBackgroundColor:
        'Background colour of the toggle button switch (the bit that slides from left to right)',
    checkboxBorderWidth: 'Border width for checkboxes',
    checkboxBorderRadius: 'Border radius for checkboxes',
    checkboxUncheckedBackgroundColor: 'Background colour of an unchecked checkbox',
    checkboxUncheckedBorderColor: 'Border colour of an unchecked checkbox',
    checkboxCheckedBackgroundColor: 'Background colour of a checked checkbox',
    checkboxCheckedBorderColor: 'Border colour of a checked checkbox',
    checkboxCheckedShapeImage: 'An image defining the shape of the check mark on checked checkboxes.',
    checkboxCheckedShapeColor: 'The colour of the check mark on checked checkboxes.',
    checkboxIndeterminateBackgroundColor: 'Background colour of an indeterminate checkbox',
    checkboxIndeterminateBorderColor: 'Border colour of an indeterminate checkbox',
    checkboxIndeterminateShapeImage: 'An image defining the shape of the dash mark on indeterminate checkboxes',
    checkboxIndeterminateShapeColor: 'The colour of the dash mark on indeterminate checkboxes',
    radioCheckedShapeImage: 'An image defining the shape of the mark on checked radio buttons',
    menuBorder: 'Border around menus e.g. column menu and right-click context menu',
    menuBackgroundColor: 'Background colour for menus e.g. column menu and right-click context menu',
    menuTextColor: 'Text colour for menus e.g. column menu and right-click context menu',
    menuShadow: 'Shadow for menus e.g. column menu and right-click context menu',
    menuSeparatorColor:
        'Colour of the dividing line between sections of menus e.g. column menu and right-click context menu',
    setFilterIndentSize:
        'Amount of indentation for each level of child items in the Set Filter list when filtering tree data.',
    chartMenuPanelWidth: 'Width of the chart editing panel for integrated charts',
    chartMenuLabelColor: 'Colour of form field labels within the chart editing panel for integrated charts',
    iconButtonHoverColor: 'Hover colour for clickable icons',
    dialogShadow: 'Shadow for popup dialogs such as the integrated charts and the advanced filter builder.',
    dialogBorder: 'Border colour popup dialogs such as the integrated charts and the advanced filter builder.',
    panelBackgroundColor:
        'Background colour for panels and dialogs such as the integrated charts and the advanced filter builder.',
    panelTitleBarBackgroundColor:
        'Background colour for the title bar of panels and dialogs such as the integrated charts and the advanced filter builder.',
    panelTitleBarBorder:
        'Border below the title bar of panels and dialogs such as the integrated charts and the advanced filter builder.',
    columnSelectIndentSize:
        'Amount of indentation for each level of children when selecting grouped columns in the column select widget.',
    toolPanelSeparatorBorder:
        'The dividing line between sections of menus e.g. column menu and right-click context menu',
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
    iconButtonHoverBackgroundColor: 'Background colour of clickable icons when hovered',
    iconSize: 'The size of square icons and icon-buttons',

    primaryColor:
        'Application primary colour as defined to the Material Design specification. Only used by Material theme parts.',

    //
    // TABS
    //
    tabBarBackgroundColor: 'Background colour of the container for tabs',
    tabBarBorder: 'Border below the container for tabs',
    tabBarTopPadding: 'Padding at the top of the container for tabs',
    tabBarHorizontalPadding: 'Padding at the left and right of the container for tabs',

    tabBackgroundColor: 'Background colour of tabs',
    tabTextColor: 'Colour of text within tabs',
    tabSpacing: 'Spacing between tabs',
    tabHorizontalPadding: 'Padding inside the top and bottom sides of the container for tabs',
    tabTopPadding: 'Padding at the top of the container for tabs',
    tabBottomPadding: 'Padding at the bottom of the container for tabs',

    tabHoverBackgroundColor: 'Background colour of tabs when hovered over',
    tabHoverTextColor: 'Colour of text within tabs when hovered over',

    tabSelectedTextColor: 'Colour of text within the selected tabs',
    tabSelectedBackgroundColor: 'Background colour of selected tabs',
    tabSelectedBorderWidth: 'Width of the border around selected tabs',
    tabSelectedBorderColor: 'Colour of the border around selected tabs',
    tabSelectedUnderlineColor: 'Colour of line drawn under selected tabs',
    tabSelectedUnderlineWidth: 'Width of line drawn under selected tabs',
    tabSelectedUnderlineTransitionDuration:
        'Duration of the fade in/out transition for the line drawn under selected tabs',

    //
    // INPUTS
    //
    inputBackgroundColor: 'Background colour for text inputs',
    inputBorder:
        'Border around text inputs. By default the border is drawn all around the input, when using Material Design inputs the border is drawn underneath',
    inputBorderRadius: 'Corner radius of the border around text inputs',
    inputTextColor: 'Colour of text within text inputs',
    inputPaddingStart: 'Padding at the start of text in text inputs',
    inputHeight: 'Minimum height of text inputs',
    inputFocusBackgroundColor: 'Background colour for focussed text inputs',
    inputFocusBorder:
        'Border around focussed text inputs. By default the border is drawn all around the input, when using Material Design inputs the border is drawn underneath',
    inputFocusShadow: 'Shadow around focussed text inputs',
    inputFocusTextColor: 'Colour of text within focussed text inputs',
    inputDisabledBackgroundColor: 'Background colour for disabled text inputs',
    inputDisabledBorder:
        'Border around disabled text inputs. By default the border is drawn all around the input, when using Material Design inputs the border is drawn underneath',
    inputDisabledTextColor: 'Colour of text within disabled text inputs',
    inputInvalidBackgroundColor: 'Background colour for text inputs in an invalid state',
    inputInvalidBorder:
        'Border around text inputs in an invalid state. By default the border is drawn all around the input, when using Material Design inputs the border is drawn underneath',
    inputInvalidTextColor: 'Colour of text within text inputs in an invalid state',
    rowLoadingSkeletonEffectColor:
        'Colour of the skeleton loading effect used when loading row data with the Server-side Row Model',
};

export const getParamDocs = (param: string): string | undefined => {
    return docs[param];
};

export const getParamDocsKeys = () => Object.keys(docs);
