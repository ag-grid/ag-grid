import type {
    BorderValue,
    ColorSchemeValue,
    ColorValue,
    FontFamilyValue,
    FontWeightValue,
    LengthValue,
    ScaleValue,
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

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
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
     * Default shadow for elements that float above the grid and are intended to appear elevated byt still attached e.g. dropdowns and cell editors
     */
    cardShadow: ShadowValue;

    /**
     * Background color for non-data areas of the grid. Headers, tool panels and menus use this color by default.
     */
    chromeBackgroundColor: ColorValue;

    /**
     * Sets the default value for `cellFontSize` and is involved in the default calculation of `listItemHeight`
     */
    dataFontSize: LengthValue;

    /**
     * Border color popup dialogs such as the integrated charts panel and the advanced filter builder.
     */
    dialogBorder: BorderValue;

    /**
     * Shadow for popup dialogs such as the integrated charts panel and the advanced filter builder.
     */
    dialogShadow: ShadowValue;

    /**
     * Background color of the drag and drop image component element when dragging columns or rows
     */
    dragAndDropImageBackgroundColor: ColorValue;

    /**
     * Border color of the drag and drop image component element when dragging columns or rows
     */
    dragAndDropImageBorder: BorderValue;

    /**
     * Border color of the drag and drop image component element when dropping is not allowed
     */
    dragAndDropImageNotAllowedBorder: BorderValue;

    /**
     * Shadow for the drag and drop image component element when dragging columns or rows
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
     * Shadow around UI controls that have focus and contain validation errors e.g. text inputs, text-areas. The value must a valid CSS box-shadow.
     */
    focusErrorShadow: ShadowValue;

    /**
     * Default font family for all text. Can be overridden by more specific parameters like `headerFontFamily`.
     */
    fontFamily: FontFamilyValue;

    /**
     * Default font size for text throughout the grid UI
     */
    fontSize: LengthValue;

    /**
     * Default font weight for text throughout the grid UI
     */
    fontWeight: FontWeightValue;

    /**
     * Default color for neutral UI elements. Most text, borders and backgrounds are defined as semi-transparent versions of this color, resulting in a blend between the background and foreground colours.
     */
    foregroundColor: ColorValue;

    /**
     * Background color for header and header-like components
     */
    headerBackgroundColor: ColorValue;

    /**
     * Font family of text in the header and header-like components
     */
    headerFontFamily: FontFamilyValue;

    /**
     * Size of text in the header and header-like components
     */
    headerFontSize: LengthValue;

    /**
     * Font weight of text in the header and header-like components
     */
    headerFontWeight: FontWeightValue;

    /**
     * Height of header and header-like components. NOTE: by default this value is calculated to leave enough room for text, icons and padding. Most applications should leave it as is and use headerVerticalPaddingScale to change padding.
     */
    headerHeight: LengthValue;

    /**
     * Color of text in the header and header-like components
     */
    headerTextColor: ColorValue;

    /**
     * Multiply the header vertical padding by a number, e.g. 1.5 to increase by 50%
     */
    headerVerticalPaddingScale: ScaleValue;

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
     * Background color for menus e.g. column menu and right-click context menu
     */
    menuBackgroundColor: ColorValue;

    /**
     * Border around menus e.g. column menu and right-click context menu
     */
    menuBorder: BorderValue;

    /**
     * Color of the dividing line between sections of menus e.g. column menu and right-click context menu
     */
    menuSeparatorColor: ColorValue;

    /**
     * Shadow for menus e.g. column menu and right-click context menu
     */
    menuShadow: ShadowValue;

    /**
     * Text color for menus e.g. column menu and right-click context menu
     */
    menuTextColor: ColorValue;

    /**
     * Background color for panels and dialogs such as the advanced filter builder. Note that for the integrated charts panel, the chart fully fills the panel so no background is visible behind it - set the chart theme to change its background.
     */
    panelBackgroundColor: ColorValue;

    /**
     * The height of the title bar of panels and dialogs such as the integrated charts panel and the advanced filter builder.
     */
    panelTitleBarHeight: LengthValue;

    /**
     * Background color for the title bar of panels and dialogs such as the integrated charts panel and the advanced filter builder.
     */
    panelTitleBarBackgroundColor: ColorValue;

    /**
     * Text color for the title bar of panels and dialogs such as the integrated charts panel and the advanced filter builder.
     */
    panelTitleBarTextColor: ColorValue;

    /**
     * Icon color for the title bar of panels and dialogs such as the integrated charts panel and the advanced filter builder.
     */
    panelTitleBarIconColor: ColorValue;

    /**
     * Font family for the title bar of panels and dialogs such as the integrated charts panel and the advanced filter builder.
     */
    panelTitleBarFontFamily: FontFamilyValue;

    /**
     * Size of text for the title bar of panels and dialogs such as the integrated charts panel and the advanced filter builder.
     */
    panelTitleBarFontSize: LengthValue;

    /**
     * Font weight for the title bar of panels and dialogs such as the integrated charts panel and the advanced filter builder.
     */
    panelTitleBarFontWeight: FontWeightValue;

    /**
     * Border below the title bar of panels and dialogs such as the integrated charts panel and the advanced filter builder.
     */
    panelTitleBarBorder: BorderValue;

    /**
     * Minimum height of picker fields such as select dropdowns and color pickers. Picker fields may be taller than this if they contain larger content.
     */
    pickerFieldHeight: LengthValue;

    /**
     * Default shadow for elements that float above the grid and are intended to appear separated from it e.g. dialogs and menus
     */
    popupShadow: ShadowValue;

    /**
     * Amount of spacing around and inside UI elements. All padding and margins in the grid are defined as a multiple of this value.
     */
    spacing: LengthValue;

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

    /**
     * The horizontal padding of containers that contain stacked widgets, such as menus and tool panels
     */
    widgetContainerHorizontalPadding: LengthValue;

    /**
     * The vertical padding of containers that contain stacked widgets, such as menus and tool panels
     */
    widgetContainerVerticalPadding: LengthValue;

    /**
     * The spacing between widgets in containers arrange widgets horizontally
     */
    widgetHorizontalSpacing: LengthValue;

    /**
     * The spacing between widgets in containers arrange widgets vertically
     */
    widgetVerticalSpacing: LengthValue;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const defaultLightColorSchemeParams = {
    backgroundColor: '#fff',
    foregroundColor: '#181d1f',
    borderColor: foregroundMix(0.15),
    chromeBackgroundColor: foregroundBackgroundMix(0.02),
    browserColorScheme: 'light',
} as const;

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const defaultFontFamily = () => [
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Oxygen-Sans',
    'Ubuntu',
    'Cantarell',
    'Helvetica Neue',
    'sans-serif',
];

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const sharedDefaults: Readonly<SharedThemeParams> = {
    ...defaultLightColorSchemeParams,
    textColor: foregroundColor,
    accentColor: '#2196f3',
    invalidColor: '#e02525',
    fontFamily: defaultFontFamily(),
    subtleTextColor: {
        ref: 'textColor',
        mix: 0.5,
    },
    borderWidth: 1,
    borderRadius: 4,
    spacing: 8,
    fontSize: 14,
    fontWeight: 400,
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
    panelBackgroundColor: backgroundColor,
    panelTitleBarHeight: { ref: 'headerHeight' },
    panelTitleBarBackgroundColor: {
        ref: 'headerBackgroundColor',
    },
    panelTitleBarIconColor: {
        ref: 'headerTextColor',
    },
    panelTitleBarTextColor: {
        ref: 'headerTextColor',
    },
    panelTitleBarFontFamily: {
        ref: 'headerFontFamily',
    },
    panelTitleBarFontSize: {
        ref: 'headerFontSize',
    },
    panelTitleBarFontWeight: {
        ref: 'headerFontWeight',
    },
    panelTitleBarBorder: true,
    // Unlike other picker field params, pickerFieldHeight must be a shared param
    // because the pagination panel height depends on it
    pickerFieldHeight: {
        calc: 'max(iconSize, fontSize) + spacing * 2',
    },
    dialogShadow: {
        ref: 'popupShadow',
    },
    dialogBorder: {
        color: foregroundMix(0.2),
    },
    widgetContainerHorizontalPadding: {
        calc: 'spacing * 1.5',
    },
    widgetContainerVerticalPadding: {
        calc: 'spacing * 1.5',
    },
    widgetHorizontalSpacing: {
        calc: 'spacing * 1.5',
    },
    widgetVerticalSpacing: {
        ref: 'spacing',
    },
    dataFontSize: {
        ref: 'fontSize',
    },
    headerBackgroundColor: {
        ref: 'chromeBackgroundColor',
    },
    headerFontFamily: {
        ref: 'fontFamily',
    },
    headerFontSize: {
        ref: 'fontSize',
    },
    headerFontWeight: 500,
    headerTextColor: {
        ref: 'textColor',
    },
    headerHeight: {
        calc: 'max(iconSize, headerFontSize) + spacing * 4 * headerVerticalPaddingScale',
    },
    headerVerticalPaddingScale: 1,
    menuBorder: {
        color: foregroundMix(0.2),
    },
    menuBackgroundColor: foregroundBackgroundMix(0.03),
    menuTextColor: foregroundBackgroundMix(0.95),
    menuShadow: {
        ref: 'popupShadow',
    },
    menuSeparatorColor: {
        ref: 'borderColor',
    },
};
