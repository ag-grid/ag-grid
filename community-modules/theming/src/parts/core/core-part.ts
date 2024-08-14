import type { ThemeParams } from '../../GENERATED-param-types';
import { createPart } from '../../theme-types';

export { coreCSS } from './GENERATED-core';

export const coreDefaults = {
    backgroundColor: '#FFF',
    foregroundColor: '#181d1f',
    textColor: {
        ref: 'foregroundColor',
    },
    accentColor: '#2196f3',
    invalidColor: '#e02525',
    borderColor: {
        ref: 'foregroundColor',
        mix: 0.15,
    },
    wrapperBorder: true,
    rowBorder: true,
    browserColorScheme: 'inherit',
    headerRowBorder: {
        ref: 'rowBorder',
    },
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
    fontFamily: { googleFont: 'IBM Plex Sans' },
    chromeBackgroundColor: {
        ref: 'foregroundColor',
        mix: 0.02,
    },
    headerBackgroundColor: {
        ref: 'chromeBackgroundColor',
    },
    headerFontFamily: {
        ref: 'fontFamily',
    },
    headerFontWeight: 500,
    headerFontSize: {
        ref: 'fontSize',
    },
    headerTextColor: {
        ref: 'textColor',
    },
    headerCellHoverBackgroundColor: 'transparent',
    headerCellMovingBackgroundColor: { ref: 'backgroundColor' },
    headerCellBackgroundTransitionDuration: '0.2s',
    cellTextColor: {
        ref: 'textColor',
    },
    subtleTextColor: {
        ref: 'textColor',
        mix: 0.5,
    },
    rangeSelectionBorderStyle: 'solid',
    rangeSelectionBorderColor: {
        ref: 'accentColor',
    },
    rangeSelectionBackgroundColor: {
        ref: 'accentColor',
        mix: 0.2,
    },
    rangeSelectionChartBackgroundColor: '#0058FF1A',
    rangeSelectionChartCategoryBackgroundColor: '#00FF841A',
    rangeSelectionHighlightColor: {
        ref: 'accentColor',
        mix: 0.5,
    },
    rowHoverColor: {
        ref: 'accentColor',
        mix: 0.12,
    },
    columnHoverColor: {
        ref: 'accentColor',
        mix: 0.05,
    },
    selectedRowBackgroundColor: {
        ref: 'accentColor',
        mix: 0.08,
    },
    modalOverlayBackgroundColor: {
        ref: 'backgroundColor',
        mix: 0.66,
    },
    oddRowBackgroundColor: {
        ref: 'backgroundColor',
    },
    borderRadius: 4,
    wrapperBorderRadius: 8,
    cellHorizontalPadding: {
        calc: 'gridSize * 2 * cellHorizontalPaddingScale',
    },
    cellWidgetSpacing: {
        calc: 'gridSize * 1.5',
    },
    cellHorizontalPaddingScale: 1,
    rowGroupIndentSize: {
        calc: 'cellWidgetSpacing + iconSize',
    },
    valueChangeDeltaUpColor: '#43a047',
    valueChangeDeltaDownColor: '#e53935',
    valueChangeValueHighlightBackgroundColor: '#16a08580',
    gridSize: 8,
    fontSize: 14,
    rowHeight: {
        calc: 'max(iconSize, fontSize) + gridSize * 3.5 * rowVerticalPaddingScale',
    },
    rowVerticalPaddingScale: 1,
    headerHeight: {
        calc: 'max(iconSize, fontSize) + gridSize * 4.25 * headerVerticalPaddingScale',
    },
    headerVerticalPaddingScale: 1,
    popupShadow: {
        radius: 16,
        color: '#00000026',
    },
    dropdownShadow: {
        radius: 4,
        spread: 1,
        offsetY: 1,
        color: '#babfc766',
    },
    dragGhostBackgroundColor: {
        ref: 'backgroundColor',
    },
    dragGhostBorder: true,
    dragGhostShadow: {
        ref: 'popupShadow',
    },
    focusShadow: {
        spread: 3,
        color: { ref: 'accentColor', mix: 0.5 },
    },
    sideBarPanelWidth: 250,
    sideButtonSelectedBorder: true,
    sideButtonSelectedBackgroundColor: {
        ref: 'backgroundColor',
    },
    sideBarBackgroundColor: {
        ref: 'chromeBackgroundColor',
    },
    headerColumnResizeHandleHeight: '30%',
    headerColumnResizeHandleWidth: 2,
    headerColumnResizeHandleColor: {
        ref: 'borderColor',
    },
    widgetContainerHorizontalPadding: {
        calc: 'gridSize * 1.5',
    },
    widgetContainerVerticalPadding: {
        calc: 'gridSize * 1.5',
    },
    widgetHorizontalSpacing: {
        calc: 'gridSize * 1.5',
    },
    widgetVerticalSpacing: {
        ref: 'gridSize',
    },
    listItemHeight: {
        calc: 'iconSize + widgetVerticalSpacing',
    },
    iconSize: 16,
    toggleButtonWidth: 28,
    toggleButtonHeight: 18,
    toggleButtonBorderWidth: 2,
    toggleButtonOnBorderColor: {
        ref: 'accentColor',
    },
    toggleButtonOnBackgroundColor: {
        ref: 'accentColor',
    },
    toggleButtonOffBorderColor: {
        ref: 'foregroundColor',
        mix: 0.3,
        onto: 'backgroundColor',
    },
    toggleButtonOffBackgroundColor: {
        ref: 'foregroundColor',
        mix: 0.3,
        onto: 'backgroundColor',
    },
    toggleButtonSwitchBorderColor: {
        ref: 'toggleButtonOffBorderColor',
    },
    toggleButtonSwitchBackgroundColor: {
        ref: 'backgroundColor',
    },
    menuBorder: {
        color: {
            ref: 'foregroundColor',
            mix: 0.2,
        },
    },
    menuBackgroundColor: {
        ref: 'foregroundColor',
        mix: 0.03,
        onto: 'backgroundColor',
    },
    menuTextColor: {
        ref: 'foregroundColor',
        mix: 0.95,
        onto: 'backgroundColor',
    },
    menuShadow: {
        ref: 'popupShadow',
    },
    menuSeparatorColor: {
        ref: 'borderColor',
    },
    setFilterIndentSize: {
        ref: 'iconSize',
    },
    chartMenuPanelWidth: 260,
    chartMenuLabelColor: {
        ref: 'foregroundColor',
        mix: 0.8,
    },
    iconButtonHoverColor: {
        ref: 'foregroundColor',
        mix: 0.1,
    },
    dialogShadow: {
        ref: 'popupShadow',
    },
    dialogBorder: {
        color: {
            ref: 'foregroundColor',
            mix: 0.2,
        },
    },
    panelBackgroundColor: {
        ref: 'backgroundColor',
    },
    panelTitleBarBackgroundColor: {
        ref: 'headerBackgroundColor',
    },
    panelTitleBarBorder: true,
    columnSelectIndentSize: {
        ref: 'iconSize',
    },
    toolPanelSeparatorBorder: true,
    tooltipBackgroundColor: {
        ref: 'chromeBackgroundColor',
    },
    tooltipTextColor: {
        ref: 'textColor',
    },
    tooltipBorder: true,

    columnDropCellBackgroundColor: {
        ref: 'foregroundColor',
        mix: 0.07,
    },
    columnDropCellBorder: {
        color: {
            ref: 'foregroundColor',
            mix: 0.13,
        },
    },
    selectCellBackgroundColor: {
        ref: 'foregroundColor',
        mix: 0.07,
    },
    selectCellBorder: {
        color: {
            ref: 'foregroundColor',
            mix: 0.13,
        },
    },
    advancedFilterBuilderButtonBarBorder: true,
    advancedFilterBuilderIndentSize: {
        calc: 'gridSize * 2 + iconSize',
    },
    advancedFilterBuilderJoinPillColor: '#f08e8d',
    advancedFilterBuilderColumnPillColor: '#a6e194',
    advancedFilterBuilderOptionPillColor: '#f3c08b',
    advancedFilterBuilderValuePillColor: '#85c0e4',
    filterToolPanelGroupIndent: {
        ref: 'gridSize',
    },
    iconButtonHoverBackgroundColor: {
        ref: 'foregroundColor',
        mix: 0.1,
    },
    rowLoadingSkeletonEffectColor: 'rgba(66, 66, 66, 0.2)',
} satisfies Partial<ThemeParams>;

export type CoreParam = keyof typeof coreDefaults;

export const coreParams = Object.keys(coreDefaults) as readonly CoreParam[];

export const getCoreDefaults = () => ({ ...coreDefaults });
