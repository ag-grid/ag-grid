import type { FontFamilyValue } from 'ag-stack';
import {
    accentColor,
    accentMix,
    backgroundColor,
    createPart,
    defaultFontFamily,
    defaultLightColorSchemeParams,
    foregroundBackgroundMix,
    foregroundColor,
    foregroundMix,
} from 'ag-stack';

import colorSchemeHighContrastCSS from './color-scheme-high-contrast.css';

const makeColorSchemeLightTreeShakeable = () =>
    createPart({
        feature: 'colorScheme',
        params: defaultLightColorSchemeParams,
    });

export const colorSchemeLight = /*#__PURE__*/ makeColorSchemeLightTreeShakeable();

const makeColorSchemeLightWarmTreeShakeable = () =>
    createPart({
        feature: 'colorScheme',
        params: {
            ...defaultLightColorSchemeParams,
            foregroundColor: '#000000de',
            borderColor: '#60300026',
            chromeBackgroundColor: '#60300005',
        },
    });

export const colorSchemeLightWarm = /*#__PURE__*/ makeColorSchemeLightWarmTreeShakeable();

const makeColorSchemeLightColdTreeShakeable = () =>
    createPart({
        feature: 'colorScheme',
        params: {
            ...defaultLightColorSchemeParams,
            foregroundColor: '#000',
            chromeBackgroundColor: '#f3f8f8',
        },
    });

export const colorSchemeLightCold = /*#__PURE__*/ makeColorSchemeLightColdTreeShakeable();

const darkParams = () =>
    ({
        ...defaultLightColorSchemeParams,
        cellBatchEditTextColor: '#f3d0b3',
        backgroundColor: 'hsl(217, 0%, 17%)',
        foregroundColor: '#FFF',
        chromeBackgroundColor: foregroundBackgroundMix(0.05),
        rowHoverColor: accentMix(0.15),
        selectedRowBackgroundColor: accentMix(0.2),
        menuBackgroundColor: foregroundBackgroundMix(0.1),
        browserColorScheme: 'dark',
        popupShadow: '0 0px 20px #000A',
        cardShadow: '0 1px 4px 1px #000A',
        advancedFilterBuilderJoinPillColor: '#7a3a37',
        advancedFilterBuilderColumnPillColor: '#355f2d',
        advancedFilterBuilderOptionPillColor: '#5a3168',
        advancedFilterBuilderValuePillColor: '#374c86',
        filterPanelApplyButtonColor: foregroundColor,
        columnPanelApplyButtonColor: foregroundColor,
        findMatchColor: backgroundColor,
        findActiveMatchColor: backgroundColor,
        checkboxUncheckedBorderColor: foregroundBackgroundMix(0.4),
        toggleButtonOffBackgroundColor: foregroundBackgroundMix(0.4),
        rowBatchEditBackgroundColor: foregroundBackgroundMix(0.1),
        formulaToken1Color: '#4da3e5',
        formulaToken2Color: '#f55864',
        formulaToken3Color: '#b688f2',
        formulaToken4Color: '#24bb4a',
        formulaToken5Color: '#e772ba',
        formulaToken6Color: '#f69b5f',
        formulaToken7Color: '#a3e6ff',
        calculatedColumnReferenceColor: '#4da3e5',
        calculatedColumnFunctionColor: '#24bb4a',
    }) as const;

const makeColorSchemeDarkTreeShakeable = () =>
    createPart({
        feature: 'colorScheme',
        params: darkParams(),
    });

export const colorSchemeDark = /*#__PURE__*/ makeColorSchemeDarkTreeShakeable();

const makeColorSchemeDarkWarmTreeShakeable = () =>
    createPart({
        feature: 'colorScheme',
        params: {
            backgroundColor: 'hsl(29, 10%, 17%)',
            foregroundColor: '#FFF',
            browserColorScheme: 'dark',
        },
    });

const darkBlueParams = () =>
    ({
        ...darkParams(),
        backgroundColor: '#1f2836',
    }) as const;

export const colorSchemeDarkWarm = /*#__PURE__*/ makeColorSchemeDarkWarmTreeShakeable();

const makeColorSchemeDarkBlueTreeShakeable = () =>
    createPart({
        feature: 'colorScheme',
        params: darkBlueParams(),
    });

export const colorSchemeDarkBlue = /*#__PURE__*/ makeColorSchemeDarkBlueTreeShakeable();

const makeColorSchemeVariableTreeShakeable = () =>
    createPart({
        feature: 'colorScheme',
        params: defaultLightColorSchemeParams,
        modeParams: {
            light: defaultLightColorSchemeParams,
            dark: darkParams(),
            'dark-blue': darkBlueParams(),
        },
    });

export const colorSchemeVariable = /*#__PURE__*/ makeColorSchemeVariableTreeShakeable();

// Applies to borders and dividers, primary should be 7:1 on every neutral background in both modes
const highContrastSeparatorColor = {
    primary: foregroundBackgroundMix(0.8),
    secondary: foregroundBackgroundMix(0.5),
    tertiary: foregroundBackgroundMix(0.2),
};

const highContrastBorderWidth = 2;

const highContrastFontFamily = (): FontFamilyValue => [
    { googleFont: 'Atkinson Hyperlegible Next' },
    ...defaultFontFamily(),
];

const highContrastNumericFontFamily = (): FontFamilyValue => [
    { googleFont: 'Atkinson Hyperlegible Mono' },
    'monospace',
];

const highContrastBorderRadius = 2;

const highContrastParams = () =>
    ({
        borderColor: highContrastSeparatorColor.secondary,
        rowBorder: { color: highContrastSeparatorColor.tertiary },
        menuBorder: { color: highContrastSeparatorColor.secondary },
        dialogBorder: { color: highContrastSeparatorColor.secondary },
        selectCellBorder: { width: highContrastBorderWidth, color: highContrastSeparatorColor.primary },
        columnDropCellBackgroundColor: backgroundColor,
        columnDropCellBorder: { width: highContrastBorderWidth, color: highContrastSeparatorColor.primary },
        tabBarBackgroundColor: foregroundMix(0.025),
        menuBackgroundColor: { ref: 'chromeBackgroundColor' },
        subtleTextColor: foregroundBackgroundMix(0.7),
        tabTextColor: { ref: 'subtleTextColor' },
        filterPanelCardSubtleColor: { ref: 'subtleTextColor' },
        menuTextColor: { ref: 'textColor' },
        notePopupTextColor: { ref: 'subtleTextColor' },
        calculatedColumnParentSuggestionColor: { ref: 'subtleTextColor' },
        dragHandleColor: { ref: 'textColor' },
        columnDropCellButtonColor: { ref: 'textColor' },
        columnDropEmptyMessageTextColor: { ref: 'subtleTextColor' },
        columnDropEmptyMessageBorderColor: highContrastSeparatorColor.secondary,
        chromeBackgroundColor: foregroundBackgroundMix(0.025),
        headerTextColor: { ref: 'subtleTextColor' },
        panelTitleBarIconColor: { ref: 'textColor' },
        fontFamily: highContrastFontFamily(),
        numericFontFamily: highContrastNumericFontFamily(),
        fontSize: 16,
        iconSize: 18,
        headerFontWeight: 400,
        headerFontSize: 14,
        statusBarLabelColor: { ref: 'subtleTextColor' },
        statusBarFontSize: 15,
        rowVerticalPaddingScale: 30 / 26,
        headerVerticalPaddingScale: 36 / 32,
        listItemHeight: { calc: 'max(iconSize, dataFontSize) + widgetVerticalSpacing + 4px' },
        inputHeight: { calc: 'max(iconSize, fontSize) + spacing * 2 + 4px' },
        pickerFieldHeight: { calc: 'max(iconSize, fontSize) + spacing * 2 + 4px' },
        buttonVerticalPadding: { calc: 'spacing + 2px' },
        tabTopPadding: { calc: 'spacing + 2px' },
        tabBottomPadding: { calc: 'spacing + 2px' },
        toggleButtonHeight: 22,
        toggleButtonWidth: 32,
        statusBarLabelFontWeight: 400,
        statusBarValueFontWeight: 600,
        headerRowBorder: { color: highContrastSeparatorColor.secondary },
        footerRowBorder: { color: highContrastSeparatorColor.secondary },
        inputPlaceholderTextColor: { ref: 'subtleTextColor' },
        inputIconColor: { ref: 'subtleTextColor' },
        inputDisabledTextColor: { ref: 'textColor' },
        inputBorder: { width: highContrastBorderWidth, color: highContrastSeparatorColor.primary },
        inputFocusBorder: { width: highContrastBorderWidth, color: accentColor },
        inputInvalidBorder: { width: highContrastBorderWidth, color: { ref: 'invalidColor' } },
        inputDisabledBorder: { width: highContrastBorderWidth, color: foregroundMix(0.2) },
        inputDisabledBackgroundColor: backgroundColor,
        pickerButtonBorder: { ref: 'inputBorder' },
        headerColumnResizeHandleColor: { ref: 'textColor' },
        checkboxBorderWidth: highContrastBorderWidth,
        checkboxUncheckedBorderColor: highContrastSeparatorColor.primary,
        // opaque so the border, drawn over the background, isn't darker than it
        checkboxIndeterminateBackgroundColor: foregroundBackgroundMix(0.69),
        checkboxIndeterminateBorderColor: { ref: 'checkboxIndeterminateBackgroundColor' },
        toggleButtonOffBackgroundColor: { ref: 'subtleTextColor' },
        focusShadow: { spread: 3, color: { ref: 'accentColor', mix: 0.75 } },
        focusErrorShadow: { spread: 3, color: { ref: 'invalidColor', mix: 0.75 } },
        tabSelectedUnderlineColor: accentColor,
        tabSelectedUnderlineWidth: 3,
        sideButtonSelectedUnderlineColor: accentColor,
        sideButtonSelectedUnderlineWidth: 3,
        sideButtonSelectedBorder: { color: highContrastSeparatorColor.tertiary },
        sideButtonSelectedBackgroundColor: { ref: 'backgroundColor' },
        listItemHighlightOutlineColor: accentColor,
        listItemHighlightOutlineWidth: 2,
        selectedRowBorder: { color: accentColor },
        selectedRowRangeSelectionBorderColor: accentColor,
        selectedRowDragIndicatorColor: accentColor,
        selectedRowDragHandleColor: accentColor,
        selectedRowCellEditingBorder: { color: { ref: 'selectedRowTextColor' } },
        selectedRowCheckboxCheckedBackgroundColor: accentColor,
        selectedRowCheckboxCheckedBorderColor: accentColor,
        selectedRowCheckboxCheckedShapeColor: backgroundColor,
        rowNumbersSelectedColor: { ref: 'accentColor', mix: 0.15 },
        calculatedColumnReferenceColor: { ref: 'formulaToken1Color' },
        calculatedColumnFunctionColor: { ref: 'formulaToken4Color' },
        chartMenuPaletteDotColor: 'transparent',
        chartMenuPaletteDotHoverColor: foregroundMix(0.2),
        chartMenuPaletteDotBorder: { width: highContrastBorderWidth, color: highContrastSeparatorColor.primary },
        sliderThumbBorderWidth: highContrastBorderWidth,
        sliderThumbBorderColor: highContrastSeparatorColor.primary,
        sliderTrackColor: highContrastSeparatorColor.primary,
        chartMenuThumbnailBorderColor: highContrastSeparatorColor.tertiary,
        iconColor: { ref: 'textColor' },
        buttonTextColor: { ref: 'foregroundColor' },
        buttonBorder: { width: highContrastBorderWidth, color: highContrastSeparatorColor.primary },
        buttonActiveBorder: { width: highContrastBorderWidth, color: accentColor },
        rowHoverColor: accentMix(0.08),
        selectedRowBackgroundColor: accentMix(0.16),
        pinnedColumnBorder: { color: highContrastSeparatorColor.secondary },
        sidePanelBorder: { color: highContrastSeparatorColor.secondary },
        toolbarTextColor: { ref: 'textColor' },
        cellFocusBorderWidth: highContrastBorderWidth,
        borderRadius: highContrastBorderRadius,
        wrapperBorderRadius: highContrastBorderRadius,
        iconButtonBorderRadius: highContrastBorderRadius,
        colorPickerTrackBorderRadius: highContrastBorderRadius,
        colorPickerColorBorderRadius: highContrastBorderRadius,
    }) as const;

const highContrastLightParams = () =>
    ({
        ...defaultLightColorSchemeParams,
        ...highContrastParams(),
        foregroundColor: '#000',
        subtleTextColor: foregroundBackgroundMix(0.8),
        accentColor: '#3730a3',
        invalidColor: '#901d1d',
        valueChangeDeltaUpColor: '#104819',
        valueChangeDeltaDownColor: '#791818',
        findMatchBackgroundColor: '#f17800',
        findActiveMatchBackgroundColor: '#874300',
        findActiveMatchColor: '#fff',
        formulaToken1Color: '#244c8f',
        formulaToken2Color: '#922830',
        formulaToken3Color: '#5f3b8c',
        formulaToken4Color: '#005d17',
        formulaToken5Color: '#812e61',
        formulaToken6Color: '#883600',
        formulaToken7Color: '#1a5469',
    }) as const;

const makeColorSchemeHighContrastLightTreeShakeable = () =>
    createPart({
        feature: 'colorScheme',
        params: highContrastLightParams(),
        css: colorSchemeHighContrastCSS,
    });

export const colorSchemeHighContrastLight = /*#__PURE__*/ makeColorSchemeHighContrastLightTreeShakeable();

const highContrastDarkParams = () =>
    ({
        ...darkParams(),
        ...highContrastParams(),
        backgroundColor: '#000',
        foregroundColor: '#fff',
        accentColor: '#a5b4fc',
        invalidColor: '#ff8080',
        valueChangeDeltaUpColor: '#81c784',
        valueChangeDeltaDownColor: '#ff9c9c',
        findMatchBackgroundColor: '#ffff00',
        findActiveMatchBackgroundColor: '#f07800',
        rangeSelectionHighlightColor: { ref: 'accentColor', mix: 0.45 },
        findActiveMatchColor: '#000',
        formulaToken1Color: '#6fb6ec',
        formulaToken2Color: '#ff7b84',
        formulaToken3Color: '#c39cf5',
        formulaToken5Color: '#f08ccb',
        columnPanelApplyButtonColor: backgroundColor,
        filterPanelApplyButtonColor: backgroundColor,
    }) as const;

const makeColorSchemeHighContrastDarkTreeShakeable = () =>
    createPart({
        feature: 'colorScheme',
        params: highContrastDarkParams(),
        css: colorSchemeHighContrastCSS,
    });

export const colorSchemeHighContrastDark = /*#__PURE__*/ makeColorSchemeHighContrastDarkTreeShakeable();

const makeColorSchemeHighContrastVariableTreeShakeable = () =>
    createPart({
        feature: 'colorScheme',
        params: highContrastLightParams(),
        modeParams: {
            light: highContrastLightParams(),
            dark: highContrastDarkParams(),
        },
        css: colorSchemeHighContrastCSS,
    });

export const colorSchemeHighContrastVariable = /*#__PURE__*/ makeColorSchemeHighContrastVariableTreeShakeable();
