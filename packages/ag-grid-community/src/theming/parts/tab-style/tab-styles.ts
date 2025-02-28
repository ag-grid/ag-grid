import { createPart } from '../../Part';
import type { Part } from '../../Part';
import type { BorderValue, ColorValue, DurationValue, LengthValue } from '../../theme-types';
import { accentColor, backgroundColor, foregroundMix } from '../../theme-utils';
import { tabStyleBaseCSS } from './tab-style-base.css-GENERATED';
import { tabStyleRolodexCSS } from './tab-style-rolodex.css-GENERATED';

export type TabStyleParams = {
    /**
     * Background color of tabs
     */
    tabBackgroundColor: ColorValue;

    /**
     * Background color of the container for tabs
     */
    tabBarBackgroundColor: ColorValue;

    /**
     * Border below the container for tabs
     */
    tabBarBorder: BorderValue;

    /**
     * Padding at the left and right of the container for tabs
     */
    tabBarHorizontalPadding: LengthValue;

    /**
     * Padding at the top of the container for tabs
     */
    tabBarTopPadding: LengthValue;

    /**
     * Padding at the bottom of the container for tabs
     */
    tabBottomPadding: LengthValue;

    /**
     * Padding inside the top and bottom sides of the container for tabs
     */
    tabHorizontalPadding: LengthValue;

    /**
     * Background color of tabs when hovered over
     */
    tabHoverBackgroundColor: ColorValue;

    /**
     * Color of text within tabs when hovered over
     */
    tabHoverTextColor: ColorValue;

    /**
     * Background color of selected tabs
     */
    tabSelectedBackgroundColor: ColorValue;

    /**
     * Color of the border around selected tabs
     */
    tabSelectedBorderColor: ColorValue;

    /**
     * Width of the border around selected tabs
     */
    tabSelectedBorderWidth: LengthValue;

    /**
     * Color of text within the selected tabs
     */
    tabSelectedTextColor: ColorValue;

    /**
     * Color of line drawn under selected tabs
     */
    tabSelectedUnderlineColor: ColorValue;

    /**
     * Duration in seconds of the fade in/out transition for the line drawn under selected tabs
     */
    tabSelectedUnderlineTransitionDuration: DurationValue;

    /**
     * Width of line drawn under selected tabs
     */
    tabSelectedUnderlineWidth: LengthValue;

    /**
     * Spacing between tabs
     */
    tabSpacing: LengthValue;

    /**
     * Color of text within tabs
     */
    tabTextColor: ColorValue;

    /**
     * Padding at the top of the container for tabs
     */
    tabTopPadding: LengthValue;
};

const baseParams: TabStyleParams = {
    tabBarBackgroundColor: 'transparent',
    tabBarHorizontalPadding: 0,
    tabBarTopPadding: 0,

    tabBackgroundColor: 'transparent',
    tabTextColor: {
        ref: 'textColor',
    },
    tabHorizontalPadding: {
        ref: 'spacing',
    },
    tabTopPadding: {
        ref: 'spacing',
    },
    tabBottomPadding: {
        ref: 'spacing',
    },
    tabSpacing: '0',

    tabHoverBackgroundColor: {
        ref: 'tabBackgroundColor',
    },
    tabHoverTextColor: {
        ref: 'tabTextColor',
    },

    tabSelectedBackgroundColor: {
        ref: 'tabBackgroundColor',
    },
    tabSelectedTextColor: {
        ref: 'tabTextColor',
    },
    tabSelectedBorderWidth: 1,
    tabSelectedBorderColor: 'transparent',
    tabSelectedUnderlineColor: 'transparent',
    tabSelectedUnderlineWidth: 0,
    tabSelectedUnderlineTransitionDuration: 0,
    tabBarBorder: false,
};

const makeTabStyleBaseTreeShakeable = () =>
    createPart<TabStyleParams>({
        feature: 'tabStyle',
        params: baseParams,
        css: tabStyleBaseCSS,
    });

/**
 * This base tab style adds no visual styling, it provides a base upon which a
 * tab style can be built by setting the tab-related params
 */
export const tabStyleBase: Part<TabStyleParams> = /*#__PURE__*/ makeTabStyleBaseTreeShakeable();

const makeTabStyleQuartzTreeShakeable = () =>
    createPart<TabStyleParams>({
        feature: 'tabStyle',
        params: {
            ...baseParams,
            tabBarBorder: true,
            tabBarBackgroundColor: foregroundMix(0.05),
            tabTextColor: {
                ref: 'textColor',
                mix: 0.7,
            },
            tabSelectedTextColor: {
                ref: 'textColor',
            },
            tabHoverTextColor: {
                ref: 'textColor',
            },
            tabSelectedBorderColor: {
                ref: 'borderColor',
            },
            tabSelectedBackgroundColor: backgroundColor,
        },
        css: tabStyleBaseCSS,
    });

/**
 * Tabs styled for the Quartz theme
 */
export const tabStyleQuartz: Part<TabStyleParams> = /*#__PURE__*/ makeTabStyleQuartzTreeShakeable();

const makeTabStyleMaterialTreeShakeable = () =>
    createPart<TabStyleParams>({
        feature: 'tabStyle',
        params: {
            ...baseParams,
            tabBarBackgroundColor: {
                ref: 'chromeBackgroundColor',
            },
            tabSelectedUnderlineColor: {
                ref: 'primaryColor',
            },
            tabSelectedUnderlineWidth: 2,
            tabSelectedUnderlineTransitionDuration: 0,
        },
        css: tabStyleBaseCSS,
    });

/**
 * Tabs styled for the Material theme
 */
export const tabStyleMaterial: Part<TabStyleParams> = /*#__PURE__*/ makeTabStyleMaterialTreeShakeable();

const makeTabStyleAlpineTreeShakeable = () =>
    createPart<TabStyleParams>({
        feature: 'tabStyle',
        params: {
            ...baseParams,
            tabBarBorder: true,
            tabBarBackgroundColor: {
                ref: 'chromeBackgroundColor',
            },
            tabHoverTextColor: accentColor,
            tabSelectedTextColor: accentColor,
            tabSelectedUnderlineColor: accentColor,
            tabSelectedUnderlineWidth: 2,
            tabSelectedUnderlineTransitionDuration: '0.3s',
        },
        css: tabStyleBaseCSS,
    });

/**
 * Tabs styled for the Alpine theme
 */
export const tabStyleAlpine: Part<TabStyleParams> = /*#__PURE__*/ makeTabStyleAlpineTreeShakeable();

const makeTabStyleRolodexTreeShakeable = () =>
    createPart<TabStyleParams>({
        feature: 'tabStyle',
        params: {
            ...baseParams,
            tabBarBackgroundColor: {
                ref: 'chromeBackgroundColor',
            },
            tabBarHorizontalPadding: {
                ref: 'spacing',
            },
            tabBarTopPadding: {
                ref: 'spacing',
            },
            tabBarBorder: true,
            tabHorizontalPadding: { calc: 'spacing * 2' },
            tabTopPadding: {
                ref: 'spacing',
            },
            tabBottomPadding: {
                ref: 'spacing',
            },
            tabSpacing: {
                ref: 'spacing',
            },
            tabSelectedBorderColor: {
                ref: 'borderColor',
            },
            tabSelectedBackgroundColor: backgroundColor,
        },
        css: () => tabStyleBaseCSS + tabStyleRolodexCSS,
    });

/**
 * Tabs where the selected tab appears raised and attached the the active
 * content, like a rolodex or operating system tabs.
 */
export const tabStyleRolodex: Part<TabStyleParams> = /*#__PURE__*/ makeTabStyleRolodexTreeShakeable();
