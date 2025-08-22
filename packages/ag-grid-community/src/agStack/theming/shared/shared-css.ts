import type {
    BorderValue,
    ColorSchemeValue,
    ColorValue,
    FontFamilyValue,
    LengthValue,
    ShadowValue,
} from '../themeTypes';
import {
    accentColor,
    accentMix,
    backgroundColor,
    foregroundBackgroundMix,
    foregroundColor,
    foregroundMix,
} from '../themeUtils';

export interface SharedThemeParams {
    /**
     * The 'brand color' for the grid, used wherever a non-neutral color is required. Selections, focus outlines and checkboxes use the accent color by default.
     */
    accentColor: ColorValue;

    /**
     * Background color of the grid. Many UI elements are semi-transparent, so their color blends with the background color.
     */
    backgroundColor: ColorValue;

    /**
     * Default color for borders.
     */
    borderColor: ColorValue;

    /**
     * Default width for borders.
     */
    borderWidth: LengthValue;

    /**
     * Default corner radius for many UI elements such as menus, dialogs and form widgets.
     */
    borderRadius: LengthValue;

    /**
     * The CSS color-scheme to apply to the grid, which affects the default appearance of browser scrollbars form inputs unless these have been styled with CSS.
     */
    browserColorScheme: ColorSchemeValue;

    /**
     * Background color for non-data areas of the grid. Headers, tool panels and menus use this color by default.
     */
    chromeBackgroundColor: ColorValue;

    /**
     * Background color of the drag and drop image component element when dragging columns or rows
     */
    dragAndDropImageBackgroundColor: ColorValue;

    /**
     * Border color of the drag and drop image component element when dragging columns or rows
     */
    dragAndDropImageBorder: BorderValue;

    /**
     * Border color of the drag and drop image component element when dragging columns or rows
     */
    dragAndDropImageNotAllowedBorder: BorderValue;

    /**
     * Shadow for the drag and drop image component element when dragging columns
     */
    dragAndDropImageShadow: ShadowValue;

    /**
     * Default shadow for dropdown menus
     */
    dropdownShadow: ShadowValue;

    /**
     * Shadow around UI controls that have focus e.g. text inputs and buttons. The value must a valid CSS box-shadow.
     */
    focusShadow: ShadowValue;

    /**
     * 'Shadow around UI controls that have focus and contain validation errors e.g. text inputs, text-areas. The value must a valid CSS box-shadow.',
     */
    focusErrorShadow: ShadowValue;

    /**
     * Default font family for all text. Can be overridden by more specific parameters like `headerFontFamily`
     */
    fontFamily: FontFamilyValue;

    /**
     * Default font size for text throughout the grid UI
     */
    fontSize: LengthValue;

    /**
     * Default color for neutral UI elements. Most text, borders and backgrounds are defined as semi-transparent versions of this color, resulting in a blend between the background and foreground colours.
     */
    foregroundColor: ColorValue;

    /**
     * Amount of spacing around and inside UI elements. All padding and margins in the grid are defined as a multiple of this value.
     */
    spacing: LengthValue;

    /**
     * Color for icons, or `inherit` to take on the text color of the containing component
     */
    iconColor: ColorValue;

    /**
     * The size of square icons and icon-buttons
     */
    iconSize: LengthValue;

    /**
     * The color for inputs and UI controls in an invalid state.
     */
    invalidColor: ColorValue;

    /**
     * Height of items in scrolling lists e.g. dropdown select inputs and column menu set filters.
     */
    listItemHeight: LengthValue;

    /**
     * Default shadow for elements that float above the grid and are intended to appear separated from it e.g. dialogs and menus
     */
    popupShadow: ShadowValue;

    /**
     * Default shadow for elements that float above the grid and are intended to appear elevated byt still attached e.g. dropdowns and cell editors
     */
    cardShadow: ShadowValue;

    /**
     * Color of text and UI elements that should stand out less than the default.
     */
    subtleTextColor: ColorValue;

    /**
     * Default color for all text
     */
    textColor: ColorValue;

    /**
     * Width of the whole toggle button component
     */
    toggleButtonWidth: LengthValue;

    /**
     * Height of the whole toggle button component
     */
    toggleButtonHeight: LengthValue;

    /**
     * Color of the toggle button background in its 'off' state
     */
    toggleButtonOffBackgroundColor: ColorValue;

    /**
     * Color of the toggle button background in its 'on' state
     */
    toggleButtonOnBackgroundColor: ColorValue;

    /**
     * Background color of the toggle button switch (the bit that slides from left to right)
     */
    toggleButtonSwitchBackgroundColor: ColorValue;

    /**
     * The amount that the toggle switch is inset from the edge of the button
     */
    toggleButtonSwitchInset: LengthValue;

    /**
     * Background color for tooltips
     */
    tooltipBackgroundColor: ColorValue;

    /**
     * Background color for tooltips showing errors
     */
    tooltipErrorBackgroundColor: ColorValue;

    /**
     * Border for tooltips
     */
    tooltipBorder: BorderValue;

    /**
     * Border for tooltips showing errors
     */
    tooltipErrorBorder: BorderValue;

    /**
     * Text color for tooltips
     */
    tooltipTextColor: ColorValue;

    /**
     * Text color for tooltips showing errors
     */
    tooltipErrorTextColor: ColorValue;
}

export const defaultLightColorSchemeParams = {
    backgroundColor: '#fff',
    foregroundColor: '#181d1f',
    borderColor: foregroundMix(0.15),
    chromeBackgroundColor: foregroundBackgroundMix(0.02),
    browserColorScheme: 'light',
} as const;

export const sharedDefaults: Readonly<SharedThemeParams> = {
    ...defaultLightColorSchemeParams,
    textColor: foregroundColor,
    accentColor: '#2196f3',
    invalidColor: '#e02525',
    fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'Oxygen-Sans',
        'Ubuntu',
        'Cantarell',
        'Helvetica Neue',
        'sans-serif',
    ],
    subtleTextColor: {
        ref: 'textColor',
        mix: 0.5,
    },
    borderWidth: 1,
    borderRadius: 4,
    spacing: 8,
    fontSize: 14,
    focusShadow: {
        spread: 3,
        color: accentMix(0.5),
    },
    focusErrorShadow: {
        spread: 3,
        color: {
            ref: 'invalidColor',
            onto: 'backgroundColor',
            mix: 0.5,
        },
    },
    popupShadow: '0 0 16px #00000026',
    cardShadow: '0 1px 4px 1px #00000018',
    dropdownShadow: { ref: 'cardShadow' },
    listItemHeight: {
        calc: 'max(iconSize, dataFontSize) + widgetVerticalSpacing',
    },
    dragAndDropImageBackgroundColor: backgroundColor,
    dragAndDropImageBorder: true,
    dragAndDropImageNotAllowedBorder: {
        color: {
            ref: 'invalidColor',
            onto: 'dragAndDropImageBackgroundColor',
            mix: 0.5,
        },
    },
    dragAndDropImageShadow: {
        ref: 'popupShadow',
    },
    iconSize: 16,
    iconColor: 'inherit',
    toggleButtonWidth: 28,
    toggleButtonHeight: 18,
    toggleButtonOnBackgroundColor: accentColor,
    toggleButtonOffBackgroundColor: foregroundBackgroundMix(0.3),
    toggleButtonSwitchBackgroundColor: backgroundColor,
    toggleButtonSwitchInset: 2,
    tooltipBackgroundColor: {
        ref: 'chromeBackgroundColor',
    },
    tooltipErrorBackgroundColor: {
        ref: 'invalidColor',
        onto: 'backgroundColor',
        mix: 0.1,
    },
    tooltipTextColor: {
        ref: 'textColor',
    },
    tooltipErrorTextColor: {
        ref: 'invalidColor',
    },
    tooltipBorder: true,
    tooltipErrorBorder: {
        color: {
            ref: 'invalidColor',
            onto: 'backgroundColor',
            mix: 0.25,
        },
    },
};
