import { calc, ref, transparentForeground, transparentRef } from '../../css-helpers';
import { definePart, extendPart } from '../../theme-utils';
import { tabStyleBaseCSS } from './GENERATED-tab-style-base';
import { tabStyleRolodexCSS } from './GENERATED-tab-style-rolodex';

export const tabParamDocs = {};

/**
 * This base tab style adds no visual styling, it provides a base upon which a
 * tab style can be built by setting the tab-related params
 */
export const tabStyleBase = definePart({
    partId: 'tabStyle',
    variantId: 'base',
    additionalParams: {
        tabBarBackgroundColor: 'transparent',
        tabBarHorizontalPadding: '0',
        tabBarTopPadding: '0',

        tabBackgroundColor: 'transparent',
        tabTextColor: ref('textColor'),
        tabHorizontalPadding: calc('gridSize'),
        tabTopPadding: calc('gridSize'),
        tabBottomPadding: calc('gridSize'),
        tabSpacing: '0',

        tabHoverBackgroundColor: ref('tabBackgroundColor'),
        tabHoverTextColor: ref('tabTextColor'),

        tabSelectedBackgroundColor: ref('tabBackgroundColor'),
        tabSelectedTextColor: ref('tabTextColor'),
        tabSelectedBorderWidth: '1px',
        tabSelectedBorderColor: 'transparent',
        tabSelectedUnderlineColor: 'transparent',
        tabSelectedUnderlineWidth: '0',
        tabSelectedUnderlineTransitionDuration: '0',
        tabBarBorder: false,
    },
    css: [tabStyleBaseCSS],
});

/**
 * Tabs styled for the Quartz theme
 */
export const tabStyleQuartz = extendPart(tabStyleBase, {
    variantId: 'quartz',
    overrideParams: {
        tabBarBorder: true,
        tabBarBackgroundColor: transparentForeground(0.05),
        tabTextColor: transparentRef('textColor', 0.7),
        tabSelectedTextColor: ref('textColor'),
        tabHoverTextColor: ref('textColor'),
        tabSelectedBorderColor: ref('borderColor'),
        tabSelectedBackgroundColor: ref('backgroundColor'),
    },
});

/**
 * Tabs styled for the Material theme
 */
export const tabStyleMaterial = extendPart(tabStyleBase, {
    variantId: 'material',
    overrideParams: {
        tabBarBackgroundColor: ref('chromeBackgroundColor'),
        tabSelectedUnderlineColor: ref('primaryColor'),
        tabSelectedUnderlineWidth: '2px',
        tabSelectedUnderlineTransitionDuration: '0',
    },
    additionalParams: {
        primaryColor: '#3f51b5',
    },
});

/**
 * Tabs styled for the Alpine theme
 */
export const tabStyleAlpine = extendPart(tabStyleBase, {
    variantId: 'alpine',
    overrideParams: {
        tabBarBorder: true,
        tabBarBackgroundColor: ref('chromeBackgroundColor'),
        tabHoverTextColor: ref('accentColor'),
        tabSelectedTextColor: ref('accentColor'),
        tabSelectedUnderlineColor: ref('accentColor'),
        tabSelectedUnderlineWidth: '2px',
        tabSelectedUnderlineTransitionDuration: '0.3s',
    },
});

/**
 * Tabs where the selected tab appears raised and attached the the active
 * content, like a rolodex or operating system tabs.
 */
export const tabStyleRolodex = extendPart(tabStyleBase, {
    variantId: 'rolodex',
    overrideParams: {
        tabBarBackgroundColor: ref('chromeBackgroundColor'),
        tabBarHorizontalPadding: ref('gridSize'),
        tabBarTopPadding: ref('gridSize'),
        tabBarBorder: true,

        tabHorizontalPadding: calc('gridSize * 2'),
        tabTopPadding: calc('gridSize'),
        tabBottomPadding: calc('gridSize'),
        tabSpacing: calc('gridSize'),

        tabSelectedBorderColor: ref('borderColor'),
        tabSelectedBackgroundColor: ref('backgroundColor'),
    },
    css: [tabStyleRolodexCSS],
});

export const allTabStyles = [tabStyleBase, tabStyleQuartz, tabStyleAlpine, tabStyleMaterial, tabStyleRolodex];
