import {
    accentColor,
    accentMix,
    backgroundColor,
    createPart,
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

// Applies to borders and dividers, primary should be 3:1 on every neutral background in both modes, secondary should be 2:1 on every neutral background in both modes
const highContrastSeperatorColor = {
    primary: foregroundBackgroundMix(0.6),
    secondary: foregroundBackgroundMix(0.3),
    tertiary: foregroundBackgroundMix(0.1),
};

type HighContrastSeparatorColor = typeof highContrastSeperatorColor;

const highContrastParams = (separatorColor: HighContrastSeparatorColor) =>
    ({
        borderColor: separatorColor.secondary, //foregroundMix(0.3),
        rowBorder: { color: separatorColor.tertiary },
        menuBorder: { color: separatorColor.secondary },
        dialogBorder: { color: separatorColor.secondary },
        selectCellBorder: { color: foregroundMix(0.26) },
        columnDropCellBackgroundColor: backgroundColor,
        columnDropCellBorder: { color: separatorColor.primary },
        tabBarBackgroundColor: foregroundMix(0.025),
        menuBackgroundColor: { ref: 'chromeBackgroundColor' },
        subtleTextColor: foregroundBackgroundMix(0.7),
        tabTextColor: { ref: 'subtleTextColor' },
        filterPanelCardSubtleColor: { ref: 'subtleTextColor' },
        menuTextColor: { ref: 'textColor' },
        notePopupTextColor: { ref: 'subtleTextColor' },
        calculatedColumnParentSuggestionColor: { ref: 'subtleTextColor' },
        dragHandleColor: { ref: 'textColor' },
        columnDropCellDragHandleColor: { ref: 'textColor' },
        columnDropCellButtonColor: { ref: 'textColor' },
        columnDropEmptyMessageTextColor: { ref: 'subtleTextColor' },
        columnDropEmptyMessageBorderColor: separatorColor.secondary,
        chromeBackgroundColor: foregroundBackgroundMix(0.025),
        headerTextColor: { ref: 'subtleTextColor' },
        panelTitleBarIconColor: { ref: 'textColor' },
        headerFontWeight: 500,
        headerFontSize: 13,
        statusBarLabelColor: { ref: 'subtleTextColor' },
        statusBarFontSize: 13,
        statusBarLabelFontWeight: 500,
        statusBarValueFontWeight: 600,
        headerRowBorder: { color: separatorColor.secondary },
        footerRowBorder: { color: separatorColor.secondary },
        inputPlaceholderTextColor: { ref: 'subtleTextColor' },
        inputIconColor: { ref: 'subtleTextColor' },
        inputDisabledTextColor: { ref: 'textColor' },
        inputBorder: { color: separatorColor.primary },
        inputDisabledBorder: { color: foregroundMix(0.2) },
        inputDisabledBackgroundColor: backgroundColor,
        pickerButtonBorder: { ref: 'inputBorder' },
        headerColumnResizeHandleColor: { ref: 'textColor' },
        checkboxUncheckedBorderColor: separatorColor.primary,
        // opaque so the border, drawn over the background, isn't darker than it
        checkboxIndeterminateBackgroundColor: foregroundBackgroundMix(0.69),
        checkboxIndeterminateBorderColor: { ref: 'checkboxIndeterminateBackgroundColor' },
        toggleButtonOffBackgroundColor: { ref: 'subtleTextColor' },
        focusShadow: { spread: 3, color: { ref: 'accentColor', mix: 0.75 } },
        focusErrorShadow: { spread: 3, color: { ref: 'invalidColor', mix: 0.75 } },
        tabSelectedUnderlineColor: accentColor,
        tabSelectedUnderlineWidth: 2,
        sideButtonSelectedUnderlineColor: accentColor,
        sideButtonSelectedBorder: { color: separatorColor.tertiary },
        sideButtonSelectedBackgroundColor: { ref: 'backgroundColor' },
        listItemHighlightOutlineColor: accentColor,
        listItemHighlightOutlineWidth: 2,
        // selectedRowBackgroundColor: { ref: 'accentColor', mix: 0.08 },
        selectedRowBorder: { color: accentColor },
        selectedRowRangeSelectionBorderColor: accentColor,
        selectedRowDragIndicatorColor: accentColor,
        selectedRowDragHandleColor: accentColor,
        selectedRowCellEditingBorder: { color: { ref: 'selectedRowTextColor' } },
        selectedRowCheckboxCheckedBackgroundColor: accentColor,
        selectedRowCheckboxCheckedBorderColor: accentColor,
        selectedRowCheckboxCheckedShapeColor: backgroundColor,
        valueChangeDeltaUpSelectedColor: { ref: 'valueChangeDeltaUpColor' },
        valueChangeDeltaDownSelectedColor: { ref: 'valueChangeDeltaDownColor' },
        rowNumbersSelectedColor: { ref: 'accentColor', mix: 0.15 },
        calculatedColumnReferenceColor: { ref: 'formulaToken1Color' },
        calculatedColumnFunctionColor: { ref: 'formulaToken4Color' },
        chartMenuPaletteDotColor: 'transparent',
        chartMenuPaletteDotHoverColor: foregroundMix(0.2),
        chartMenuPaletteDotBorder: { color: separatorColor.primary },
        sliderThumbBorderColor: separatorColor.primary,
        sliderTrackColor: separatorColor.primary,
        chartMenuThumbnailBorderColor: separatorColor.tertiary,
        // opaque equivalent of selectedRowBackgroundColor over the background
        chartMenuThumbnailSelectedBorderColor: { ref: 'accentColor' },
        iconColor: { ref: 'textColor' },
        buttonTextColor: { ref: 'foregroundColor' },
        buttonBorder: { color: separatorColor.primary },
        rowHoverColor: accentMix(0.08),
        selectedRowBackgroundColor: accentMix(0.16),
        pinnedColumnBorder: { color: separatorColor.secondary },
        sidePanelBorder: { color: separatorColor.secondary },
        toolbarTextColor: { ref: 'textColor' },
    }) as const;

const highContrastLightParams = (separatorColor = highContrastSeperatorColor) =>
    ({
        ...defaultLightColorSchemeParams,
        ...highContrastParams(separatorColor),
        foregroundColor: '#000',
        accentColor: '#1255a2',
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

const highContrastDarkParams = (separatorColor = highContrastSeperatorColor) =>
    ({
        ...darkParams(),
        ...highContrastParams(separatorColor),
        backgroundColor: '#000',
        foregroundColor: '#fff',
        accentColor: '#64b5f6',
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

// Each tier is one step stronger than high contrast, primary should be 7:1 on every neutral background in both modes
const ultraHighContrastSeparatorColor: HighContrastSeparatorColor = {
    primary: foregroundBackgroundMix(0.8),
    secondary: foregroundBackgroundMix(0.5),
    tertiary: foregroundBackgroundMix(0.2),
};

const ultraHighContrastBorderWidth = 2;

const ultraHighContrastParams = () =>
    ({
        buttonBorder: { width: ultraHighContrastBorderWidth, color: ultraHighContrastSeparatorColor.primary },
        buttonActiveBorder: { width: ultraHighContrastBorderWidth, color: accentColor },
        inputBorder: { width: ultraHighContrastBorderWidth, color: ultraHighContrastSeparatorColor.primary },
        inputFocusBorder: { width: ultraHighContrastBorderWidth, color: accentColor },
        inputInvalidBorder: { width: ultraHighContrastBorderWidth, color: { ref: 'invalidColor' } },
        inputDisabledBorder: { width: ultraHighContrastBorderWidth, color: foregroundMix(0.2) },
        columnDropCellBorder: { width: ultraHighContrastBorderWidth, color: ultraHighContrastSeparatorColor.primary },
        selectCellBorder: { width: ultraHighContrastBorderWidth, color: ultraHighContrastSeparatorColor.primary },
        chartMenuPaletteDotBorder: {
            width: ultraHighContrastBorderWidth,
            color: ultraHighContrastSeparatorColor.primary,
        },
        checkboxBorderWidth: ultraHighContrastBorderWidth,
        fontSize: 15,
        headerFontSize: 14,
        statusBarFontSize: 14,
        tabSelectedUnderlineWidth: 3,
        sideButtonSelectedUnderlineWidth: 3,
        sliderThumbBorderWidth: ultraHighContrastBorderWidth,
    }) as const;

const ultraHighContrastLightParams = () =>
    ({
        ...highContrastLightParams(ultraHighContrastSeparatorColor),
        ...ultraHighContrastParams(),
        subtleTextColor: foregroundBackgroundMix(0.8),
    }) as const;

const makeColorSchemeUltraHighContrastLightTreeShakeable = () =>
    createPart({
        feature: 'colorScheme',
        params: ultraHighContrastLightParams(),
        css: colorSchemeHighContrastCSS,
    });

export const colorSchemeUltraHighContrastLight = /*#__PURE__*/ makeColorSchemeUltraHighContrastLightTreeShakeable();

const ultraHighContrastDarkParams = () =>
    ({
        ...highContrastDarkParams(ultraHighContrastSeparatorColor),
        ...ultraHighContrastParams(),
    }) as const;

const makeColorSchemeUltraHighContrastDarkTreeShakeable = () =>
    createPart({
        feature: 'colorScheme',
        params: ultraHighContrastDarkParams(),
        css: colorSchemeHighContrastCSS,
    });

export const colorSchemeUltraHighContrastDark = /*#__PURE__*/ makeColorSchemeUltraHighContrastDarkTreeShakeable();

const makeColorSchemeUltraHighContrastVariableTreeShakeable = () =>
    createPart({
        feature: 'colorScheme',
        params: ultraHighContrastLightParams(),
        modeParams: {
            light: ultraHighContrastLightParams(),
            dark: ultraHighContrastDarkParams(),
        },
        css: colorSchemeHighContrastCSS,
    });

export const colorSchemeUltraHighContrastVariable =
    /*#__PURE__*/ makeColorSchemeUltraHighContrastVariableTreeShakeable();
