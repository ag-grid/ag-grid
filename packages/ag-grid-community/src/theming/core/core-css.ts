import type {
    BorderStyleValue,
    BorderValue,
    ColorValue,
    DurationValue,
    FontFamilyValue,
    FontWeightValue,
    LengthValue,
    ScaleValue,
    ShadowValue,
    SharedThemeParams,
} from 'ag-stack';
import {
    accentColor,
    accentMix,
    backgroundColor,
    foregroundColor,
    foregroundHeaderBackgroundMix,
    foregroundMix,
} from 'ag-stack';

/**
 * All possible theme param types - the actual params available will be a subset of this type depending on the parts in use by the theme.
 */
export interface CoreParams extends SharedThemeParams {
    /**
     * Color of the dividing line above the buttons in the advanced filter builder
     */
    advancedFilterBuilderButtonBarBorder: BorderValue;

    /**
     * Color of the column pills in the Advanced Filter Builder
     */
    advancedFilterBuilderColumnPillColor: ColorValue;

    /**
     * Amount that each level of the nesting in the advanced filter builder is indented by
     */
    advancedFilterBuilderIndentSize: LengthValue;

    /**
     * Color of the join operator pills in the Advanced Filter Builder
     */
    advancedFilterBuilderJoinPillColor: ColorValue;

    /**
     * Color of the filter option pills in the Advanced Filter Builder
     */
    advancedFilterBuilderOptionPillColor: ColorValue;

    /**
     * Color of the value pills in the Advanced Filter Builder
     */
    advancedFilterBuilderValuePillColor: ColorValue;

    /**
     * Minimum height of the grid's rows section when using auto-height or print layout. This prevents an empty grid from collapsing to nothing. Set to `0` to remove the minimum height.
     */
    autoHeightMinBodyHeight: LengthValue;

    /**
     * Padding at the start and end of grid cells and header cells.
     */
    cellHorizontalPadding: LengthValue;

    /**
     * Multiply the cell horizontal padding by a number, e.g. 1.5 to increase by 50%
     */
    cellHorizontalPaddingScale: ScaleValue;

    /**
     * Color of text in cells in the grid data area
     */
    cellTextColor: ColorValue;

    /**
     * Horizontal spacing between widgets inside cells (e.g. row group expand buttons and row selection checkboxes).
     */
    cellWidgetSpacing: LengthValue;

    /**
     * Color of form field labels within the chart editing panel for integrated charts
     */
    chartMenuLabelColor: ColorValue;

    /**
     * Width of the chart editing panel for integrated charts
     */
    chartMenuPanelWidth: LengthValue;

    /**
     * Vertical borders between columns within the grid only, excluding headers.
     */
    columnBorder: BorderValue;

    /**
     * Background color of the pill shape representing columns in the column drop component
     */
    columnDropCellBackgroundColor: ColorValue;

    /**
     * Text color for the pill shape representing columns in the column drop component
     */
    columnDropCellTextColor: ColorValue;

    /**
     * Color of the drag grip icon in the pill shape representing columns in the column drop component
     */
    columnDropCellDragHandleColor: ColorValue;

    /**
     * Border for the pill shape representing columns in the column drop component
     */
    columnDropCellBorder: BorderValue;

    /**
     * Background color when hovering over columns in the grid. This is not visible unless enabled in the grid options.
     */
    columnHoverColor: ColorValue;

    /**
     * Amount of indentation for each level of children when selecting grouped columns in the column select widget.
     */
    columnSelectIndentSize: LengthValue;

    /**
     * Border around cells being edited
     */
    cellEditingBorder: BorderValue;

    /**
     * Shadow for cells being edited
     */
    cellEditingShadow: ShadowValue;

    /**
     * Background color for a row with invalid editor status
     */
    fullRowEditInvalidBackgroundColor: ColorValue;

    /**
     * Background color for cells in batch edit mode
     */
    cellBatchEditBackgroundColor: ColorValue;

    /**
     * Text color for cells in batch edit mode
     */
    cellBatchEditTextColor: ColorValue;

    /**
     * Background color for rows in batch edit mode
     */
    rowBatchEditBackgroundColor: ColorValue;

    /**
     * Text color for rows in batch edit mode
     */
    rowBatchEditTextColor: ColorValue;

    /**
     * Color of the drag handle on draggable rows and column markers
     */
    dragHandleColor: ColorValue;

    /**
     * How much to indent child columns in the filters tool panel relative to their parent
     */
    filterToolPanelGroupIndent: LengthValue;

    /**
     * Color of new Filters Tool Panel apply button
     */
    filterPanelApplyButtonColor: ColorValue;

    /**
     * Background color of new Filters Tool Panel apply button
     */
    filterPanelApplyButtonBackgroundColor: ColorValue;

    /**
     * Color of Columns Tool Panel apply button
     */
    columnPanelApplyButtonColor: ColorValue;

    /**
     * Background color of Columns Tool Panel apply button
     */
    columnPanelApplyButtonBackgroundColor: ColorValue;

    /**
     * Color of text and UI elements that should stand out less than the default in new Filters Tool Panel
     */
    filterPanelCardSubtleColor: ColorValue;

    /**
     * Color of text and UI elements that should stand out less than the default in new Filters Tool Panel when hovered
     */
    filterPanelCardSubtleHoverColor: ColorValue;

    /**
     * Color of matches used in Find
     */
    findMatchColor: ColorValue;

    /**
     * Background color of matches used in Find
     */
    findMatchBackgroundColor: ColorValue;

    /**
     * Color of the active match used in Find
     */
    findActiveMatchColor: ColorValue;

    /**
     * Background color of the active match used in Find
     */
    findActiveMatchBackgroundColor: ColorValue;

    /**
     * Horizontal borders above footer components like the pagination and status bars
     */
    footerRowBorder: BorderValue;

    /**
     * Duration in seconds of the background color transition if headerCellHoverBackgroundColor or headerCellMovingBackgroundColor is set
     */
    headerCellBackgroundTransitionDuration: DurationValue;

    /**
     * Background color of a header cell when hovering over it, or `transparent` for no change.
     */
    headerCellHoverBackgroundColor: ColorValue;

    /**
     * Background color of a header cell when dragging to reposition it, or `transparent` for no change.
     */
    headerCellMovingBackgroundColor: ColorValue;

    /**
     * Vertical borders between columns within headers.
     */
    headerColumnBorder: BorderValue;

    /**
     * Height of the vertical border between column headers. Percentage values are relative to the header height.
     */
    headerColumnBorderHeight: LengthValue;

    /**
     * Color of the drag handle on resizable header columns. Set this to transparent to hide the resize handle.
     */
    headerColumnResizeHandleColor: ColorValue;

    /**
     * Height of the drag handle on resizable header columns. Percentage values are relative to the header height.
     */
    headerColumnResizeHandleHeight: LengthValue;

    /**
     * Width of the drag handle on resizable header columns.
     */
    headerColumnResizeHandleWidth: LengthValue;

    /**
     * Font family of text in grid cells
     */
    cellFontFamily: FontFamilyValue;

    /**
     * Font size of text in grid cells
     */
    cellFontSize: LengthValue;

    /**
     * Font weight of text in grid cells
     */
    cellFontWeight: FontWeightValue;

    /**
     * Borders between and below header rows.
     */
    headerRowBorder: BorderValue;

    /**
     * Default color for clickable icons
     */
    iconButtonColor: ColorValue;

    /**
     * Default background color for clickable icons
     */
    iconButtonBackgroundColor: ColorValue;

    /**
     * The distance beyond the border of the clickable icons that the background extends to
     */
    iconButtonBackgroundSpread: LengthValue;

    /**
     * Corner radius of clickable icon background
     */
    iconButtonBorderRadius: LengthValue;

    /**
     * Color of clickable icons when hovered
     */
    iconButtonHoverColor: ColorValue;

    /**
     * Background color for clickable icons when hovered
     */
    iconButtonHoverBackgroundColor: ColorValue;

    /**
     * Color of clickable icon buttons when styled as active. This is used for the column filter button when a filter is applied to the column.
     */
    iconButtonActiveColor: ColorValue;

    /**
     * Background color of clickable icon buttons when styled as active. This is used for the column filter button when a filter is applied to the column.
     */
    iconButtonActiveBackgroundColor: ColorValue;

    /**
     * Color of the marker dot shown on icon buttons when styled as active. This is used for the column filter button when a filter is applied to the column.
     */
    iconButtonActiveIndicatorColor: ColorValue;

    /**
     * Background color of the overlay shown over the grid e.g. a data loading indicator.
     */
    modalOverlayBackgroundColor: ColorValue;

    /**
     * Background color applied to grid rows. Should be a solid color, semi-transparent colors will cause issues.
     */
    dataBackgroundColor: ColorValue;

    /**
     * Alternative background colour applied to every other row to create a striped effect
     */
    oddRowBackgroundColor: ColorValue;

    /**
     * Vertical borders between columns that are pinned to the left or right and the rest of the grid
     */
    pinnedColumnBorder: BorderValue;

    /**
     * Horizontal borders between the grid and rows that are pinned to the top or bottom and the rest of the grid
     */
    pinnedRowBorder: BorderValue;

    /**
     * Font-weight for the rows that have been pinned to the top or bottom
     */
    pinnedRowFontWeight: FontWeightValue;

    /**
     * Background color for the rows that have been pinned to the top or bottom
     */
    pinnedRowBackgroundColor: ColorValue;

    /**
     * Text color for rows that have been pinned to the top or bottom
     */
    pinnedRowTextColor: ColorValue;

    /**
     * Text color for row in the main viewport that has been pinned to the top or bottom
     */
    pinnedSourceRowTextColor: ColorValue;

    /**
     * Background color for the row in the main viewport that has been pinned to the top or bottom
     */
    pinnedSourceRowBackgroundColor: ColorValue;

    /**
     * Font-weight for the row in the main viewport that has been pinned to the top or bottom
     */
    pinnedSourceRowFontWeight: FontWeightValue;

    /**
     * Background color of selected cell ranges. Choosing a semi-transparent color ensure that multiple overlapping ranges look correct.
     */
    rangeSelectionBackgroundColor: ColorValue;

    /**
     * The color used for borders around range selections. The selection background defaults to a semi-transparent version of this color.
     */
    rangeSelectionBorderColor: ColorValue;

    /**
     * Border style around range selections.
     */
    rangeSelectionBorderStyle: BorderStyleValue;

    /**
     * Background color for cells that provide data to the current range chart
     */
    rangeSelectionChartBackgroundColor: ColorValue;

    /**
     * Background color for cells that provide categories to the current range chart
     */
    rangeSelectionChartCategoryBackgroundColor: ColorValue;

    /**
     * Background color to briefly apply to a cell range when the user copies from or pastes into it.
     */
    rangeSelectionHighlightColor: ColorValue;

    /**
     * Background color of the grid header when any cell of that header is part of a range. This is not visible unless enabled in the cell selection options.
     */
    rangeHeaderHighlightColor: ColorValue;

    /**
     * Background color for the calculated column currently being edited.
     */
    calculatedColumnHighlightColor: ColorValue;

    /**
     * Color for the parent of columns in the suggestion list.
     */
    calculatedColumnParentSuggestionColor: ColorValue;

    /**
     * Width of the calculated column suggestion list opened from helper buttons.
     */
    calculatedColumnSuggestionListWidth: LengthValue;

    /**
     * Color of the indicator line used to show where a row will be inserted when dragging to reorder rows
     */
    rowDragIndicatorColor: ColorValue;

    /**
     * Width of the indicator line used to show where a row will be inserted when dragging to reorder rows
     */
    rowDragIndicatorWidth: LengthValue;

    /**
     * Color of the indicator line used to show where a row will be inserted when dragging to reorder columns
     */
    columnDragIndicatorColor: ColorValue;

    /**
     * Width of the indicator line used to show where a row will be inserted when dragging to reorder columns
     */
    columnDragIndicatorWidth: LengthValue;

    /**
     * Background color of the Row Numbers cells when the range selects all cells for that row.
     */
    rowNumbersSelectedColor: ColorValue;

    /**
     * Horizontal borders between rows.
     */
    rowBorder: BorderValue;

    /**
     * The size of indentation applied to each level of row grouping - deep rows are indented by a multiple of this value.
     */
    rowGroupIndentSize: LengthValue;

    /**
     * Height of grid rows. NOTE: by default this value is calculated to leave enough room for text, icons and padding. Most applications should leave it as is and use rowVerticalPaddingScale to change padding.
     */
    rowHeight: LengthValue;

    /**
     * Height of the pagination panel at the bottom of the grid.
     */
    paginationPanelHeight: LengthValue;

    /**
     * Background color when hovering over rows in the grid and in dropdown menus. Set to `transparent` to disable the hover effect. Note: if you want a hover effect on one but not the other, use CSS selectors instead of this property.
     */
    rowHoverColor: ColorValue;

    /**
     * Color of the skeleton loading effect used when loading row data with the Server-side Row Model
     */
    rowLoadingSkeletonEffectColor: ColorValue;

    /**
     * Multiply the row vertical padding by a number, e.g. 1.5 to increase by 50%. Has no effect if rowHeight is set.
     */
    rowVerticalPaddingScale: ScaleValue;

    /**
     * Background color for selected items within the multiple select widget
     */
    selectCellBackgroundColor: ColorValue;

    /**
     * Border for selected items within the multiple select widget
     */
    selectCellBorder: BorderValue;

    /**
     * Background color of selected rows in the grid and in dropdown menus.
     */
    selectedRowBackgroundColor: ColorValue;

    /**
     * Amount of indentation for each level of child items in the Set Filter list when filtering tree data.
     */
    setFilterIndentSize: LengthValue;

    /**
     * Background color of the sidebar that contains the columns and filters tool panels
     */
    sideBarBackgroundColor: ColorValue;

    /**
     * Background color of the row of tab buttons at the edge of the sidebar
     */
    sideButtonBarBackgroundColor: ColorValue;

    /**
     * Default width of the sidebar that contains the columns and filters tool panels
     */
    sideBarPanelWidth: LengthValue;

    /**
     * Duration of the animation when a sidebar panel opens or closes. Set to 0
     * to disable animations. Automatically disabled if the user has requested
     * reduced motion in their OS accessibility settings.
     */
    sideBarPanelAnimationDuration: DurationValue;

    /**
     * Borders between the grid and side panels including the column and filter tool bars, and chart settings
     */
    sidePanelBorder: BorderValue;

    /**
     * Spacing between the topmost side button and the top of the sidebar
     */
    sideButtonBarTopPadding: LengthValue;

    /**
     * Width of the underline below the selected tab in the sidebar
     */
    sideButtonSelectedUnderlineWidth: LengthValue;

    /**
     * Color of the underline below the selected tab in the sidebar, or 'transparent' to disable the underline effect
     */
    sideButtonSelectedUnderlineColor: ColorValue;

    /**
     * Duration of the transition effect for the underline below the selected tab in the sidebar
     */
    sideButtonSelectedUnderlineTransitionDuration: DurationValue;

    /**
     * Background color of the tab buttons in the sidebar
     */
    sideButtonBackgroundColor: ColorValue;

    /**
     * Text color of the tab buttons in the sidebar
     */
    sideButtonTextColor: ColorValue;

    /**
     * Background color of the tab buttons in the sidebar when hovered
     */
    sideButtonHoverBackgroundColor: ColorValue;

    /**
     * Text color of the tab buttons in the sidebar when hovered
     */
    sideButtonHoverTextColor: ColorValue;

    /**
     * Background color of the selected tab button in the sidebar
     */
    sideButtonSelectedBackgroundColor: ColorValue;

    /**
     * Text color of the selected tab button in the sidebar
     */
    sideButtonSelectedTextColor: ColorValue;

    /**
     * Border drawn above and below tab buttons in the sidebar
     */
    sideButtonBorder: BorderValue;

    /**
     * Border drawn above and below the selected tab button in the sidebar
     */
    sideButtonSelectedBorder: BorderValue;

    /**
     * Padding to the left of the text in tab buttons in the sidebar (this is always the padding on the inward facing side of the button, so in right-to-left layout it will be on the right)
     */
    sideButtonLeftPadding: LengthValue;

    /**
     * Padding to the right of the text in tab buttons in the sidebar (this is always the padding on the outward facing side of the button, so in right-to-left layout it will be on the left)
     */
    sideButtonRightPadding: LengthValue;

    /**
     * Padding above and below the text in tab buttons in the sidebar
     */
    sideButtonVerticalPadding: LengthValue;

    /**
     * Background color of the toolbar. Defaults to the header background color.
     */
    toolbarBackgroundColor: ColorValue;

    /**
     * Text color in the toolbar. Defaults to the header text color.
     */
    toolbarTextColor: ColorValue;

    /**
     * Border style for the vertical separator between toolbar items.
     */
    toolbarSeparatorBorder: BorderValue;

    /**
     * The dividing line between sections of menus e.g. column menu and right-click context menu
     */
    toolPanelSeparatorBorder: BorderValue;

    /**
     * Color to temporarily apply to cell data when its value decreases in an agAnimateShowChangeCellRenderer cell
     */
    valueChangeDeltaDownColor: ColorValue;

    /**
     * Color to temporarily apply to cell data when its value increases in an agAnimateShowChangeCellRenderer cell
     */
    valueChangeDeltaUpColor: ColorValue;

    /**
     * Background color to apply when a cell value changes and enableCellChangeFlash is enabled
     */
    valueChangeValueHighlightBackgroundColor: ColorValue;

    /**
     * Background color of the outermost container around the grid.
     */
    wrapperBackgroundColor: ColorValue;

    /**
     * Borders around the outside of the grid
     */
    wrapperBorder: BorderValue;

    /**
     * Corner radius of the outermost container around the grid.
     */
    wrapperBorderRadius: LengthValue;

    /**
     * Text color for labels in the status bar component
     */
    statusBarLabelColor: ColorValue;

    /**
     * Font weight for labels in the status bar component
     */
    statusBarLabelFontWeight: FontWeightValue;

    /**
     * Text color for values in the status bar component
     */
    statusBarValueColor: ColorValue;

    /**
     * Font weight for values in the status bar component
     */
    statusBarValueFontWeight: FontWeightValue;

    /**
     * The color of the 1st formula field token
     */
    formulaToken1Color: ColorValue;

    /**
     * The background color of the 1st formula field token associated range
     */
    formulaToken1BackgroundColor: ColorValue;

    /**
     * The border of the 1st formula field token associated range
     */
    formulaToken1Border: BorderValue;

    /**
     * The color of the 2nd formula field token
     */
    formulaToken2Color: ColorValue;

    /**
     * The background color of the 2nd formula field token associated range
     */
    formulaToken2BackgroundColor: ColorValue;

    /**
     * The border of the 2nd formula field token associated range
     */
    formulaToken2Border: BorderValue;

    /**
     * The color of the 3rd formula field token
     */
    formulaToken3Color: ColorValue;

    /**
     * The background color of the 3rd formula field token associated range
     */
    formulaToken3BackgroundColor: ColorValue;

    /**
     * The border of the 3rd formula field token associated range
     */
    formulaToken3Border: BorderValue;

    /**
     * The color of the 4th formula field token
     */
    formulaToken4Color: ColorValue;

    /**
     * The background color of the 4th formula field token associated range
     */
    formulaToken4BackgroundColor: ColorValue;

    /**
     * The border of the 4th formula field token associated range
     */
    formulaToken4Border: BorderValue;

    /**
     * The color of the 5th formula field token
     */
    formulaToken5Color: ColorValue;

    /**
     * The background color of the 5th formula field token associated range
     */
    formulaToken5BackgroundColor: ColorValue;

    /**
     * The border of the 5th formula field token associated range
     */
    formulaToken5Border: BorderValue;

    /**
     * The color of the 6th formula field token
     */
    formulaToken6Color: ColorValue;

    /**
     * The background color of the 6th formula field token associated range
     */
    formulaToken6BackgroundColor: ColorValue;

    /**
     * The border of the 6th formula field token associated range
     */
    formulaToken6Border: BorderValue;

    /**
     * The color of the 7th formula field token
     */
    formulaToken7Color: ColorValue;

    /**
     * The background color of the 7th formula field token associated range
     */
    formulaToken7BackgroundColor: ColorValue;

    /**
     * The border of the 7th formula field token associated range
     */
    formulaToken7Border: BorderValue;

    /**
     * The color of the note indicator
     */
    noteIndicatorColor: ColorValue;

    /**
     * The size of the note indicator
     */
    noteIndicatorSize: LengthValue;

    /**
     * The background color of the note popup
     */
    notePopupBackgroundColor: ColorValue;

    /**
     * The color of the note popup text
     */
    notePopupTextColor: ColorValue;

    /**
     * The color of the note popup input text
     */
    notePopupInputTextColor: ColorValue;

    /**
     * The background color of the note popup input
     */
    notePopupInputBackgroundColor: ColorValue;

    /**
     * The border of the note popup
     */
    notePopupBorder: BorderValue;

    /**
     * The padding inside the note popup
     */
    notePopupPadding: LengthValue;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const coreDefaults: Readonly<Omit<CoreParams, keyof SharedThemeParams>> = {
    wrapperBorder: true,
    rowBorder: true,
    headerRowBorder: true,
    footerRowBorder: {
        ref: 'rowBorder',
    },
    columnBorder: {
        style: 'solid',
        width: 1,
        color: 'transparent',
    },
    headerColumnBorder: false,
    headerColumnBorderHeight: '100%',
    pinnedColumnBorder: true,
    pinnedRowBorder: true,
    sidePanelBorder: true,
    sideBarPanelWidth: 250,
    sideBarPanelAnimationDuration: 0,
    sideBarBackgroundColor: {
        ref: 'chromeBackgroundColor',
    },
    sideButtonBarBackgroundColor: {
        ref: 'sideBarBackgroundColor',
    },
    sideButtonBarTopPadding: 0,
    sideButtonSelectedUnderlineWidth: 2,
    sideButtonSelectedUnderlineColor: 'transparent',
    sideButtonSelectedUnderlineTransitionDuration: 0,
    sideButtonBackgroundColor: 'transparent',
    sideButtonTextColor: { ref: 'textColor' },
    sideButtonHoverBackgroundColor: { ref: 'sideButtonBackgroundColor' },
    sideButtonHoverTextColor: { ref: 'sideButtonTextColor' },
    sideButtonSelectedBackgroundColor: backgroundColor,
    sideButtonSelectedTextColor: { ref: 'sideButtonTextColor' },
    sideButtonBorder: 'solid 1px transparent',
    sideButtonSelectedBorder: true,
    sideButtonLeftPadding: { ref: 'spacing' },
    sideButtonRightPadding: { ref: 'spacing' },
    sideButtonVerticalPadding: { calc: 'spacing * 3' },
    cellFontFamily: {
        ref: 'fontFamily',
    },
    cellFontSize: {
        ref: 'dataFontSize',
    },
    cellFontWeight: {
        ref: 'fontWeight',
    },
    headerCellHoverBackgroundColor: 'transparent',
    headerCellMovingBackgroundColor: { ref: 'headerCellHoverBackgroundColor' },
    headerCellBackgroundTransitionDuration: '0.2s',
    cellTextColor: {
        ref: 'textColor',
    },
    rangeSelectionBorderStyle: 'solid',
    rangeSelectionBorderColor: accentColor,
    rangeSelectionBackgroundColor: accentMix(0.2),
    rangeSelectionChartBackgroundColor: '#0058FF1A',
    rangeSelectionChartCategoryBackgroundColor: '#00FF841A',
    rangeSelectionHighlightColor: accentMix(0.5),
    rangeHeaderHighlightColor: foregroundHeaderBackgroundMix(0.08),
    calculatedColumnHighlightColor: accentMix(0.12),
    calculatedColumnParentSuggestionColor: foregroundMix(0.75),
    calculatedColumnSuggestionListWidth: 200,
    rowNumbersSelectedColor: accentMix(0.5),
    rowHoverColor: accentMix(0.08),
    columnHoverColor: accentMix(0.05),
    selectedRowBackgroundColor: accentMix(0.12),
    modalOverlayBackgroundColor: {
        ref: 'backgroundColor',
        mix: 0.66,
    },
    dataBackgroundColor: backgroundColor,
    oddRowBackgroundColor: { ref: 'dataBackgroundColor' },
    wrapperBackgroundColor: backgroundColor,
    wrapperBorderRadius: 8,
    cellHorizontalPadding: {
        calc: 'spacing * 2 * cellHorizontalPaddingScale',
    },
    cellWidgetSpacing: {
        calc: 'spacing * 1.5',
    },
    cellHorizontalPaddingScale: 1,
    autoHeightMinBodyHeight: 150,
    rowGroupIndentSize: {
        calc: 'cellWidgetSpacing + iconSize',
    },
    valueChangeDeltaUpColor: '#43a047',
    valueChangeDeltaDownColor: '#e53935',
    valueChangeValueHighlightBackgroundColor: '#16a08580',
    rowHeight: {
        calc: 'max(iconSize, cellFontSize) + spacing * 3.25 * rowVerticalPaddingScale',
    },
    rowVerticalPaddingScale: 1,
    paginationPanelHeight: {
        calc: 'pickerFieldHeight + spacing * 1.25',
    },
    dragHandleColor: foregroundMix(0.7),
    headerColumnResizeHandleHeight: '30%',
    headerColumnResizeHandleWidth: 2,
    headerColumnResizeHandleColor: {
        ref: 'borderColor',
    },
    iconButtonColor: { ref: 'iconColor' },
    iconButtonBackgroundColor: 'transparent',
    iconButtonBackgroundSpread: 4,
    iconButtonBorderRadius: 1,
    iconButtonHoverColor: { ref: 'iconButtonColor' },
    iconButtonHoverBackgroundColor: foregroundMix(0.1),
    iconButtonActiveColor: accentColor,
    iconButtonActiveBackgroundColor: accentMix(0.28),
    iconButtonActiveIndicatorColor: accentColor,
    setFilterIndentSize: {
        ref: 'iconSize',
    },
    chartMenuPanelWidth: 260,
    chartMenuLabelColor: foregroundMix(0.8),
    cellEditingBorder: {
        color: accentColor,
    },
    cellEditingShadow: { ref: 'cardShadow' },
    fullRowEditInvalidBackgroundColor: {
        ref: 'invalidColor',
        onto: 'backgroundColor',
        mix: 0.25,
    },
    cellBatchEditBackgroundColor: 'rgba(220 181 139 / 16%)',
    cellBatchEditTextColor: '#422f00',
    rowBatchEditBackgroundColor: { ref: 'cellBatchEditBackgroundColor' },
    rowBatchEditTextColor: { ref: 'cellBatchEditTextColor' },
    columnSelectIndentSize: {
        ref: 'iconSize',
    },
    toolbarBackgroundColor: {
        ref: 'headerBackgroundColor',
    },
    toolbarTextColor: {
        ref: 'headerTextColor',
    },
    toolbarSeparatorBorder: true,
    toolPanelSeparatorBorder: true,
    columnDropCellBackgroundColor: foregroundMix(0.07),
    columnDropCellTextColor: {
        ref: 'textColor',
    },
    columnDropCellDragHandleColor: {
        ref: 'textColor',
    },
    columnDropCellBorder: {
        color: foregroundMix(0.13),
    },
    selectCellBackgroundColor: foregroundMix(0.07),
    selectCellBorder: {
        color: foregroundMix(0.13),
    },
    advancedFilterBuilderButtonBarBorder: true,
    advancedFilterBuilderIndentSize: {
        calc: 'spacing * 2 + iconSize',
    },
    advancedFilterBuilderJoinPillColor: '#f08e8d',
    advancedFilterBuilderColumnPillColor: '#a6e194',
    advancedFilterBuilderOptionPillColor: '#f3c08b',
    advancedFilterBuilderValuePillColor: '#85c0e4',
    filterPanelApplyButtonColor: backgroundColor,
    filterPanelApplyButtonBackgroundColor: accentColor,
    columnPanelApplyButtonColor: backgroundColor,
    columnPanelApplyButtonBackgroundColor: accentColor,
    filterPanelCardSubtleColor: {
        ref: 'textColor',
        mix: 0.7,
    },
    filterPanelCardSubtleHoverColor: { ref: 'textColor' },
    findMatchColor: foregroundColor,
    findMatchBackgroundColor: '#ffff00',
    findActiveMatchColor: foregroundColor,
    findActiveMatchBackgroundColor: '#ffa500',
    filterToolPanelGroupIndent: {
        ref: 'spacing',
    },
    rowLoadingSkeletonEffectColor: foregroundMix(0.15),
    statusBarLabelColor: foregroundColor,
    statusBarLabelFontWeight: 500,
    statusBarValueColor: foregroundColor,
    statusBarValueFontWeight: 500,
    pinnedSourceRowTextColor: {
        ref: 'textColor',
    },
    pinnedSourceRowBackgroundColor: {
        ref: 'dataBackgroundColor',
    },
    pinnedSourceRowFontWeight: 600,
    pinnedRowFontWeight: 600,
    pinnedRowBackgroundColor: {
        ref: 'dataBackgroundColor',
    },
    pinnedRowTextColor: {
        ref: 'textColor',
    },
    rowDragIndicatorColor: { ref: 'rangeSelectionBorderColor' },
    rowDragIndicatorWidth: 2,
    columnDragIndicatorColor: { ref: 'accentColor' },
    columnDragIndicatorWidth: 2,
    formulaToken1Color: '#3269c6',
    formulaToken1BackgroundColor: { ref: 'formulaToken1Color', mix: 0.08 },
    formulaToken1Border: { color: { ref: 'formulaToken1Color' } },
    formulaToken2Color: '#c0343f',
    formulaToken2BackgroundColor: { ref: 'formulaToken2Color', mix: 0.06 },
    formulaToken2Border: { color: { ref: 'formulaToken2Color' } },
    formulaToken3Color: '#8156b8',
    formulaToken3BackgroundColor: { ref: 'formulaToken3Color', mix: 0.08 },
    formulaToken3Border: { color: { ref: 'formulaToken3Color' } },
    formulaToken4Color: '#007c1f',
    formulaToken4BackgroundColor: { ref: 'formulaToken4Color', mix: 0.06 },
    formulaToken4Border: { color: { ref: 'formulaToken4Color' } },
    formulaToken5Color: '#b03e85',
    formulaToken5BackgroundColor: { ref: 'formulaToken5Color', mix: 0.08 },
    formulaToken5Border: { color: { ref: 'formulaToken5Color' } },
    formulaToken6Color: '#b74900',
    formulaToken6BackgroundColor: { ref: 'formulaToken6Color', mix: 0.06 },
    formulaToken6Border: { color: { ref: 'formulaToken6Color' } },
    formulaToken7Color: '#247492',
    formulaToken7BackgroundColor: { ref: 'formulaToken7Color', mix: 0.08 },
    formulaToken7Border: { color: { ref: 'formulaToken7Color' } },
    noteIndicatorColor: { ref: 'accentColor' },
    noteIndicatorSize: '8px',
    notePopupBackgroundColor: { ref: 'menuBackgroundColor' },
    notePopupTextColor: { ref: 'menuTextColor', mix: 0.75 },
    notePopupInputTextColor: { ref: 'inputTextColor' },
    notePopupInputBackgroundColor: { ref: 'inputBackgroundColor' },
    notePopupBorder: { ref: 'dialogBorder' },
    notePopupPadding: { calc: 'spacing * 0.5' },
};
