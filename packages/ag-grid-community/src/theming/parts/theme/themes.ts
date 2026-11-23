import type { ColorValue, Theme } from 'ag-stack';
import {
    accentColor,
    accentMix,
    backgroundColor,
    createPart,
    defaultFontFamily,
    foregroundBackgroundMix,
    foregroundColor,
    foregroundMix,
} from 'ag-stack';

import type { CoreParams } from '../../core/core-css';
import { createTheme } from '../../createTheme';
import type { ButtonStyleParams } from '../button-style/button-styles';
import {
    buttonStyleAlpine,
    buttonStyleBalham,
    buttonStyleBase,
    buttonStyleQuartz,
} from '../button-style/button-styles';
import type { CheckboxStyleParams } from '../checkbox-style/checkbox-styles';
import { checkboxStyleDefault } from '../checkbox-style/checkbox-styles';
import { colorSchemeVariable } from '../color-scheme/color-schemes';
import { columnDropStyleBordered, columnDropStylePlain } from '../column-drop-style/column-drop-styles';
import { iconSetBalham } from '../icon-set/balham/icon-set-balham';
import { iconSetAlpine, iconSetMaterial, iconSetQuartzRegular } from '../icon-set/icon-sets';
import type { InputStyleParams } from '../input-style/input-styles';
import { inputStyleBordered, inputStyleUnderlined } from '../input-style/input-styles';
import type { TabStyleParams } from '../tab-style/tab-styles';
import { tabStyleAlpine, tabStyleMaterial, tabStyleQuartz, tabStyleRolodex } from '../tab-style/tab-styles';
import materialAdjustmentsCSS from './material-adjustments.css';
import quartzAdjustmentsCSS from './quartz-adjustments.css';

export type ThemeDefaultParams = CoreParams &
    ButtonStyleParams &
    CheckboxStyleParams &
    TabStyleParams &
    InputStyleParams;

/**
 * Used as an entry point for collecting parameters for automated API
 * documentation generation on the website and in Theme Builder
 *
 * @knipIgnore
 */
export type AllThemeParamsForAPIDocumentation = ThemeDefaultParams;

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const themeQuartzParams = () => ({
    fontFamily: [{ googleFont: 'IBM Plex Sans' }, ...defaultFontFamily()],
});

const makeStyleQuartzTreeShakeable = () =>
    createPart({
        feature: 'styleQuartz',
        css: quartzAdjustmentsCSS,
    });

const styleQuartz = /*#__PURE__*/ makeStyleQuartzTreeShakeable();

const makeThemeQuartzTreeShakeable = () =>
    createTheme()
        .withPart(buttonStyleQuartz)
        .withPart(checkboxStyleDefault)
        .withPart(colorSchemeVariable)
        .withPart(iconSetQuartzRegular)
        .withPart(tabStyleQuartz)
        .withPart(inputStyleBordered)
        .withPart(columnDropStyleBordered)
        .withPart(styleQuartz)
        .withParams(themeQuartzParams());

export const themeQuartz: Theme<ThemeDefaultParams> =
    /*#__PURE__*/
    makeThemeQuartzTreeShakeable();

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const themeAlpineParams = () => ({
    accentColor: '#2196f3',
    selectedRowBackgroundColor: accentMix(0.3),
    inputFocusBorder: {
        color: accentMix(0.4),
    },
    focusShadow: { radius: 2, spread: 1.6, color: accentMix(0.4) },
    iconButtonHoverBackgroundColor: 'transparent',
    iconButtonActiveBackgroundColor: 'transparent',
    checkboxUncheckedBorderColor: foregroundBackgroundMix(0.45),
    checkboxIndeterminateBackgroundColor: foregroundBackgroundMix(0.45),
    checkboxIndeterminateBorderColor: foregroundBackgroundMix(0.45),
    checkboxBorderWidth: 2,
    checkboxBorderRadius: 2,
    fontSize: 13,
    dataFontSize: 14,
    headerFontWeight: 700,
    borderRadius: 3,
    wrapperBorderRadius: 3,
    tabSelectedUnderlineColor: accentColor,
    tabSelectedBorderWidth: 0,
    tabSelectedUnderlineTransitionDuration: 0.3,
    sideButtonSelectedUnderlineColor: accentColor,
    sideButtonSelectedUnderlineWidth: 2,
    sideButtonSelectedUnderlineTransitionDuration: 0.3,
    sideButtonBorder: false,
    sideButtonSelectedBorder: false,
    sideButtonBarTopPadding: { calc: 'spacing * 3' },
    sideButtonSelectedBackgroundColor: 'transparent',
    sideButtonHoverTextColor: accentColor,
    iconButtonHoverColor: accentColor,
    toggleButtonWidth: 28,
    toggleButtonHeight: 18,
    toggleButtonSwitchInset: 1,
    toggleButtonOffBackgroundColor: foregroundBackgroundMix(0.45),
    colorPickerThumbSize: 13,
    colorPickerTrackSize: 11,
    colorPickerThumbBorderWidth: 2,
    colorPickerTrackBorderRadius: 2,
    colorPickerColorBorderRadius: 2,
});

const makeThemeAlpineTreeShakeable = () =>
    createTheme()
        .withPart(buttonStyleAlpine)
        .withPart(checkboxStyleDefault)
        .withPart(colorSchemeVariable)
        .withPart(iconSetAlpine)
        .withPart(tabStyleAlpine)
        .withPart(inputStyleBordered)
        .withPart(columnDropStyleBordered)
        .withParams(themeAlpineParams());

export const themeAlpine: Theme<ThemeDefaultParams> =
    /*#__PURE__*/
    makeThemeAlpineTreeShakeable();

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const themeBalhamParams = () => ({
    accentColor: '#0091ea',
    borderColor: foregroundMix(0.2),
    spacing: 4,
    widgetVerticalSpacing: { calc: 'max(8px, spacing)' },
    borderRadius: 2,
    wrapperBorderRadius: 2,
    headerColumnResizeHandleColor: 'transparent',
    headerColumnBorder: true,
    headerColumnBorderHeight: '50%',
    oddRowBackgroundColor: {
        ref: 'chromeBackgroundColor',
        mix: 0.5,
    },
    checkboxBorderRadius: 2,
    checkboxBorderWidth: 1,
    checkboxUncheckedBackgroundColor: backgroundColor,
    checkboxUncheckedBorderColor: foregroundBackgroundMix(0.5),
    checkboxCheckedBackgroundColor: backgroundColor,
    checkboxCheckedBorderColor: accentColor,
    checkboxCheckedShapeColor: accentColor,
    checkboxIndeterminateBackgroundColor: backgroundColor,
    checkboxIndeterminateBorderColor: foregroundBackgroundMix(0.5),
    checkboxIndeterminateShapeColor: foregroundBackgroundMix(0.5),
    focusShadow: { radius: 2, spread: 1, color: accentColor },
    headerTextColor: foregroundMix(0.6),
    iconButtonHoverBackgroundColor: 'transparent',
    iconButtonActiveBackgroundColor: 'transparent',
    fontSize: 12,
    tabSelectedBackgroundColor: backgroundColor,
    headerFontWeight: 'bold',
    toggleButtonWidth: 32,
    toggleButtonHeight: 16,
    toggleButtonSwitchInset: 1,
    toggleButtonOffBackgroundColor: foregroundBackgroundMix(0.5),
    sideButtonBorder: true,
    sideButtonBarTopPadding: { calc: 'spacing * 4' },
    popupShadow: '5px 5px 10px rgba(0, 0, 0, 0.3)',
    statusBarLabelColor: foregroundMix(0.54),
    statusBarLabelFontWeight: 600,
    statusBarValueFontWeight: 600,
    panelTitleBarIconColor: foregroundColor,
    toolbarTextColor: { ref: 'headerTextColor' },
    colorPickerThumbSize: 13,
    colorPickerTrackSize: 11,
    colorPickerThumbBorderWidth: 2,
    colorPickerTrackBorderRadius: 2,
    colorPickerColorBorderRadius: 2,
});

const makeThemeBalhamTreeShakeable = () =>
    createTheme()
        .withPart(buttonStyleBalham)
        .withPart(checkboxStyleDefault)
        .withPart(colorSchemeVariable)
        .withPart(iconSetBalham)
        .withPart(tabStyleRolodex)
        .withPart(inputStyleBordered)
        .withPart(columnDropStylePlain)
        .withParams(themeBalhamParams());

export const themeBalham: Theme<ThemeDefaultParams> =
    /*#__PURE__*/
    makeThemeBalhamTreeShakeable();

export type StyleMaterialParams = {
    primaryColor: ColorValue;
};

const makeStyleMaterialTreeShakeable = () => {
    // define these overrides separately so that they don't affect the type of
    // this part - adding styleMaterial to a theme should override the value of
    // e.g. tabSelectedUnderlineColor, but not add that param to the type if
    // it's not there already
    const sharedParams: Partial<
        StyleMaterialParams & TabStyleParams & CoreParams & ButtonStyleParams & InputStyleParams
    > = {
        tabSelectedUnderlineColor: { ref: 'primaryColor' },
        sideButtonSelectedUnderlineColor: { ref: 'primaryColor' },
        buttonTextColor: { ref: 'primaryColor' },
        rangeSelectionBackgroundColor: {
            ref: 'primaryColor',
            mix: 0.2,
        },
        rangeSelectionBorderColor: {
            ref: 'primaryColor',
        },
        rangeSelectionHighlightColor: {
            ref: 'primaryColor',
            mix: 0.5,
        },
        rangeHeaderHighlightColor: {
            ref: 'foregroundColor',
            mix: 0.08,
        },
        rowNumbersSelectedColor: {
            ref: 'primaryColor',
            mix: 0.5,
        },
        inputFocusBorder: {
            width: 2,
            color: { ref: 'primaryColor' },
        },
        pickerButtonFocusBorder: {
            width: 1,
            color: { ref: 'primaryColor' },
        },
        cellEditingBorder: {
            color: { ref: 'primaryColor' },
        },
        menuBackgroundColor: { ref: 'backgroundColor' },
        sideButtonBarBackgroundColor: backgroundColor,
        sideButtonSelectedBackgroundColor: 'transparent',
        sideButtonBarTopPadding: { calc: 'spacing * 4' },
        headerColumnResizeHandleColor: 'none',
        headerBackgroundColor: {
            ref: 'backgroundColor',
        },
        rowHoverColor: foregroundMix(0.08),
        columnHoverColor: foregroundMix(0.08),
        headerCellHoverBackgroundColor: foregroundMix(0.05),
        headerTextColor: foregroundMix(0.615),
        statusBarLabelColor: foregroundMix(0.63),
        statusBarLabelFontWeight: 600,
        statusBarValueFontWeight: 600,
        valueChangeValueHighlightBackgroundColor: '#00acc1',
        panelTitleBarIconColor: foregroundColor,
        toolbarTextColor: foregroundColor,
        advancedFilterBuilderButtonBarBorder: false,
        filterPanelApplyButtonColor: { ref: 'buttonTextColor' },
        filterPanelApplyButtonBackgroundColor: { ref: 'buttonBackgroundColor' },
        columnPanelApplyButtonColor: { ref: 'buttonTextColor' },
        columnPanelApplyButtonBackgroundColor: { ref: 'buttonBackgroundColor' },
        colorPickerThumbSize: 13,
        colorPickerTrackSize: 11,
        colorPickerThumbBorderWidth: 2,
        colorPickerTrackBorderRadius: 2,
        colorPickerColorBorderRadius: 2,
        rowDragIndicatorColor: { ref: 'primaryColor' },
        columnDragIndicatorColor: { ref: 'primaryColor' },
    };

    const lightParams = {
        ...sharedParams,
        primaryColor: '#3f51b5',
        foregroundColor: '#000D',
        accentColor: '#ff4081',
        checkboxUncheckedBorderColor: foregroundColor,
        checkboxIndeterminateBackgroundColor: foregroundColor,
        toggleButtonOffBackgroundColor: foregroundColor,
        selectedRowBackgroundColor: 'rgba(33, 150, 243, 0.3)',
    } as const;

    const darkParams = {
        ...sharedParams,
        primaryColor: '#3f51b5',
        foregroundColor: '#fffD',
        accentColor: '#bb86fc',
        checkboxUncheckedBorderColor: foregroundBackgroundMix(0.5),
        checkboxIndeterminateBackgroundColor: foregroundBackgroundMix(0.5),
        toggleButtonOffBackgroundColor: foregroundBackgroundMix(0.5),
        selectedRowBackgroundColor: '#bb86fc33',
    } as const;

    return createPart<StyleMaterialParams>({
        feature: 'styleMaterial',
        css: materialAdjustmentsCSS,
        params: lightParams,
        modeParams: {
            light: lightParams,
            dark: darkParams,
            'dark-blue': darkParams,
        },
    });
};

export const styleMaterial = /*#__PURE__*/ makeStyleMaterialTreeShakeable();

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const themeMaterialParams = () => ({
    rowHeight: {
        calc: 'max(iconSize, cellFontSize) + spacing * 3.75 * rowVerticalPaddingScale',
    },
    headerHeight: {
        calc: 'max(iconSize, headerFontSize) + spacing * 4.75 * headerVerticalPaddingScale',
    },
    widgetVerticalSpacing: {
        calc: 'spacing * 1.75',
    },
    cellHorizontalPadding: { calc: 'spacing * 3' },
    buttonHorizontalPadding: { ref: 'spacing' },
    widgetContainerHorizontalPadding: { calc: 'spacing * 1.5' },
    widgetContainerVerticalPadding: { calc: 'spacing * 2' },
    fontSize: 13,
    iconSize: 18,
    borderRadius: 0,
    wrapperBorderRadius: 0,
    wrapperBorder: false,
    menuBorder: false,
    dialogBorder: false,
    panelTitleBarBorder: false,
    tabSelectedBorderWidth: 0,
    tabSelectedUnderlineTransitionDuration: 0.3,
    sidePanelBorder: false,
    sideButtonSelectedBorder: false,
    sideButtonSelectedUnderlineWidth: 2,
    sideButtonSelectedUnderlineTransitionDuration: 0.3,
    sideButtonBorder: false,
    buttonBorder: false,
    buttonDisabledBorder: false,
    focusShadow: {
        spread: 4,
        color: foregroundMix(0.16),
    },
    fontFamily: [{ googleFont: 'Roboto' }, ...defaultFontFamily()],
    inputHeight: {
        calc: 'max(iconSize, fontSize) + spacing * 3',
    },
    pickerButtonBorder: {
        width: 1,
        color: 'transparent',
    },
    headerFontWeight: 600,
    headerFontSize: { calc: 'fontSize - 1px' },
    checkboxBorderWidth: 2,
    checkboxBorderRadius: 2,
    toggleButtonWidth: 34,
    toggleButtonSwitchInset: 1,
    cardShadow: '0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12)',
    popupShadow: '5px 5px 10px rgba(0, 0, 0, 0.3)',
});

const makeThemeMaterialTreeShakeable = () =>
    /*#__PURE__*/
    createTheme()
        .withPart(buttonStyleBase)
        .withPart(checkboxStyleDefault)
        .withPart(colorSchemeVariable)
        .withPart(iconSetMaterial)
        .withPart(tabStyleMaterial)
        .withPart(inputStyleUnderlined)
        .withPart(columnDropStylePlain)
        .withPart(styleMaterial)
        .withParams(themeMaterialParams());

export const themeMaterial: Theme<ThemeDefaultParams & StyleMaterialParams> =
    /*#__PURE__*/ makeThemeMaterialTreeShakeable();
