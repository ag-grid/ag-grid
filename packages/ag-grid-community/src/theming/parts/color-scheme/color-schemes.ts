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

// Mix of foregroundColor that gives a component boundary 3:1 contrast on every neutral background
const highContrastBoundaryColor = foregroundMix(0.6);
const highContrastBoundaryBackgroundMix = foregroundBackgroundMix(0.6);

const highContrastParams = () =>
    ({
        borderColor: foregroundMix(0.3),
        menuBorder: { color: foregroundMix(0.4) },
        dialogBorder: { color: foregroundMix(0.4) },
        columnDropCellBorder: { color: foregroundMix(0.26) },
        selectCellBorder: { color: foregroundMix(0.26) },
        columnDropCellBackgroundColor: foregroundMix(0.04),
        tabBarBackgroundColor: foregroundMix(0.025),
        menuBackgroundColor: { ref: 'chromeBackgroundColor' },
        subtleTextColor: { ref: 'textColor', mix: 0.7 },
        inputPlaceholderTextColor: { ref: 'inputTextColor', mix: 0.7 },
        inputDisabledTextColor: { ref: 'textColor', mix: 0.7 },
        inputBorder: { color: highContrastBoundaryColor },
        pickerButtonBorder: { ref: 'inputBorder' },
        headerColumnResizeHandleColor: highContrastBoundaryColor,
        checkboxUncheckedBorderColor: highContrastBoundaryBackgroundMix,
        checkboxIndeterminateBackgroundColor: highContrastBoundaryBackgroundMix,
        toggleButtonOffBackgroundColor: highContrastBoundaryBackgroundMix,
        focusShadow: { spread: 3, color: accentColor },
        focusErrorShadow: { spread: 3, color: { ref: 'invalidColor' } },
        tabSelectedUnderlineColor: accentColor,
        tabSelectedUnderlineWidth: 2,
        sideButtonSelectedUnderlineColor: accentColor,
        listItemHighlightBackgroundColor: accentColor,
        listItemHighlightTextColor: backgroundColor,
        selectedRowBackgroundColor: accentColor,
        selectedRowTextColor: backgroundColor,
        selectedRowRangeSelectionBorderColor: { ref: 'selectedRowTextColor' },
        selectedRowDragIndicatorColor: { ref: 'selectedRowTextColor' },
        selectedRowDragHandleColor: { ref: 'selectedRowTextColor' },
        selectedRowCellEditingBorder: { color: { ref: 'selectedRowTextColor' } },
        selectedRowCheckboxCheckedBackgroundColor: { ref: 'selectedRowTextColor' },
        selectedRowCheckboxCheckedBorderColor: { ref: 'selectedRowTextColor' },
        selectedRowCheckboxCheckedShapeColor: { ref: 'selectedRowBackgroundColor' },
        chartMenuPaletteDotColor: 'transparent',
        chartMenuPaletteDotHoverColor: foregroundMix(0.2),
        chartMenuPaletteDotBorder: { color: highContrastBoundaryColor },
    }) as const;

const highContrastLightParams = () =>
    ({
        ...defaultLightColorSchemeParams,
        ...highContrastParams(),
        foregroundColor: '#000',
        chromeBackgroundColor: foregroundBackgroundMix(0.01),
        accentColor: '#1565c0',
        invalidColor: '#c62828',
        valueChangeDeltaUpColor: '#1b7a2b',
        valueChangeDeltaDownColor: { ref: 'invalidColor' },
        valueChangeDeltaUpSelectedColor: '#9effa6',
        valueChangeDeltaDownSelectedColor: '#ffe5e5',
        findMatchBackgroundColor: '#e37100',
        findActiveMatchBackgroundColor: '#914800',
        findActiveMatchColor: '#fff',
        listItemSelectedBackgroundColor: foregroundColor,
        listItemSelectedTextColor: backgroundColor,
    }) as const;

const makeColorSchemeHighContrastLightTreeShakeable = () =>
    createPart({
        feature: 'colorScheme',
        params: highContrastLightParams(),
    });

export const colorSchemeHighContrastLight = /*#__PURE__*/ makeColorSchemeHighContrastLightTreeShakeable();

const highContrastDarkParams = () =>
    ({
        ...darkParams(),
        ...highContrastParams(),
        backgroundColor: '#000',
        foregroundColor: '#fff',
        chromeBackgroundColor: foregroundBackgroundMix(0.025),
        accentColor: '#64b5f6',
        invalidColor: '#ff8080',
        valueChangeDeltaUpColor: '#66bb6a',
        valueChangeDeltaDownColor: { ref: 'invalidColor' },
        valueChangeDeltaUpSelectedColor: '#004706',
        valueChangeDeltaDownSelectedColor: '#850000',
        findMatchBackgroundColor: '#ffff00',
        findActiveMatchBackgroundColor: '#c86400',
        findActiveMatchColor: '#000',
        formulaToken1Color: '#6fb6ec',
        formulaToken2Color: '#ff7b84',
        formulaToken3Color: '#c39cf5',
        formulaToken5Color: '#f08ccb',
        calculatedColumnReferenceColor: { ref: 'formulaToken1Color' },
        columnPanelApplyButtonColor: backgroundColor,
        filterPanelApplyButtonColor: backgroundColor,
        // the only grey 3:1 from both the background and the accent-coloured highlighted item
        listItemSelectedBackgroundColor: foregroundBackgroundMix(0.355),
        listItemSelectedTextColor: 'inherit',
    }) as const;

const makeColorSchemeHighContrastDarkTreeShakeable = () =>
    createPart({
        feature: 'colorScheme',
        params: highContrastDarkParams(),
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
    });

export const colorSchemeHighContrastVariable = /*#__PURE__*/ makeColorSchemeHighContrastVariableTreeShakeable();
