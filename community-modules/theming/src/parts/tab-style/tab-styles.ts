import { createPart } from '../../theme-types';
import { materialColors } from '../theme/material-colors';
import { tabStyleBaseCSS } from './GENERATED-tab-style-base';
import { tabStyleRolodexCSS } from './GENERATED-tab-style-rolodex';

export const tabParamDocs = {};

/**
 * This base tab style adds no visual styling, it provides a base upon which a
 * tab style can be built by setting the tab-related params
 */
// prettier-ignore
export const tabStyleBase =
    /*#__PURE__*/
    createPart('tabStyle', 'base')
        .addParams({
            tabBarBackgroundColor: 'transparent',
            tabBarHorizontalPadding: 0,
            tabBarTopPadding: 0,

            tabBackgroundColor: 'transparent',
            tabTextColor: {
                ref: 'textColor',
            },
            tabHorizontalPadding: {
                ref: 'gridSize',
            },
            tabTopPadding: {
                ref: 'gridSize',
            },
            tabBottomPadding: {
                ref: 'gridSize',
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
            tabSelectedUnderlineWidth: '0',
            tabSelectedUnderlineTransitionDuration: '0',
            tabBarBorder: false,
        })
        .addCss(tabStyleBaseCSS);

/**
 * Tabs styled for the Quartz theme
 */
// prettier-ignore
export const tabStyleQuartz =
    /*#__PURE__*/
    tabStyleBase.createVariant('quartz')
        .overrideParams({
            tabBarBorder: true,
            tabBarBackgroundColor: {
                ref: 'foregroundColor',
                mix: 0.05,
            },
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
            tabSelectedBackgroundColor: {
                ref: 'backgroundColor',
            },
        });

/**
 * Tabs styled for the Material theme
 */
// prettier-ignore
export const tabStyleMaterial =
    /*#__PURE__*/
    tabStyleBase.createVariant('material')
        .usePart(materialColors)
        .overrideParams({
            tabBarBackgroundColor: {
                ref: 'chromeBackgroundColor',
            },
            tabSelectedUnderlineColor: {
                ref: 'primaryColor',
            },
            tabSelectedUnderlineWidth: 2,
            tabSelectedUnderlineTransitionDuration: '0',
        });

/**
 * Tabs styled for the Alpine theme
 */
// prettier-ignore
export const tabStyleAlpine =
    /*#__PURE__*/
    tabStyleBase.createVariant('alpine')
        .overrideParams({
            tabBarBorder: true,
            tabBarBackgroundColor: {
                ref: 'chromeBackgroundColor',
            },
            tabHoverTextColor: {
                ref: 'accentColor',
            },
            tabSelectedTextColor: {
                ref: 'accentColor',
            },
            tabSelectedUnderlineColor: {
                ref: 'accentColor',
            },
            tabSelectedUnderlineWidth: 2,
            tabSelectedUnderlineTransitionDuration: '0.3s',
        });

/**
 * Tabs where the selected tab appears raised and attached the the active
 * content, like a rolodex or operating system tabs.
 */
// prettier-ignore
export const tabStyleRolodex =
    /*#__PURE__*/
    tabStyleBase.createVariant('rolodex')
        .overrideParams({
            tabBarBackgroundColor: {
                ref: 'chromeBackgroundColor',
            },
            tabBarHorizontalPadding: {
                ref: 'gridSize',
            },
            tabBarTopPadding: {
                ref: 'gridSize',
            },
            tabBarBorder: true,
            tabHorizontalPadding: { calc: 'gridSize * 2' },
            tabTopPadding: {
                ref: 'gridSize',
            },
            tabBottomPadding: {
                ref: 'gridSize',
            },
            tabSpacing: {
                ref: 'gridSize',
            },
            tabSelectedBorderColor: {
                ref: 'borderColor',
            },
            tabSelectedBackgroundColor: {
                ref: 'backgroundColor',
            },
        })
        .addCss(tabStyleRolodexCSS);
