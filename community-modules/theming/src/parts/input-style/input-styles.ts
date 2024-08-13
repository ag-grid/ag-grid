import { createPart } from '../../theme-types';
import { inputStyleBaseCSS } from './GENERATED-input-style-base';
import { inputStyleUnderlinedCSS } from './GENERATED-input-style-underlined';

// prettier-ignore
export const inputStyleBase =
    /*#__PURE__*/
    createPart('inputStyle', 'base')
        .addParams({
            inputBackgroundColor: 'transparent',
            inputBorder: false,
            inputBorderRadius: 0,
            inputTextColor: {
                ref: 'textColor',
            },
            inputPaddingStart: 0,
            inputHeight: {
                calc: 'max(iconSize, fontSize) + gridSize * 2',
            },
            inputFocusBackgroundColor: {
                ref: 'inputBackgroundColor',
            },
            inputFocusBorder: {
                ref: 'inputBorder',
            },
            inputFocusShadow: 'none',
            inputFocusTextColor: {
                ref: 'inputTextColor',
            },
            inputDisabledBackgroundColor: {
                ref: 'inputBackgroundColor',
            },
            inputDisabledBorder: {
                ref: 'inputBorder',
            },
            inputDisabledTextColor: {
                ref: 'inputTextColor',
            },
            inputInvalidBackgroundColor: {
                ref: 'inputBackgroundColor',
            },
            inputInvalidBorder: {
                ref: 'inputBorder',
            },
            inputInvalidTextColor: {
                ref: 'inputTextColor',
            },
        })
        .addCss(inputStyleBaseCSS);

// prettier-ignore
export const inputStyleBordered =
    /*#__PURE__*/
    inputStyleBase.createVariant('bordered')
        .overrideParams({
            inputBackgroundColor: {
                ref: 'backgroundColor',
            },
            inputBorder: true,
            inputBorderRadius: {
                ref: 'borderRadius',
            },
            inputPaddingStart: {
                ref: 'gridSize',
            },
            inputFocusBorder: {
                color: { ref: 'accentColor' },
            },
            inputFocusShadow: {
                ref: 'focusShadow',
            },
            inputDisabledBackgroundColor: {
                ref: 'foregroundColor',
                mix: 0.06,
                onto: 'backgroundColor',
            },
            inputDisabledTextColor: {
                ref: 'textColor',
                mix: 0.5,
            },
            inputInvalidBorder: {
                color: { ref: 'invalidColor' },
            },
        });

// prettier-ignore
export const inputStyleUnderlined =
    /*#__PURE__*/
    inputStyleBase.createVariant('underlined')
        .overrideParams({
            inputBorder: {
                width: 2,
                color: {
                    ref: 'foregroundColor',
                    mix: 0.3,
                },
            },
            inputPaddingStart: {
                ref: 'gridSize',
            },
            inputFocusBorder: 'solid 2px var(--ag-accent-color)',
            inputDisabledTextColor: {
                ref: 'textColor',
                mix: 0.5,
            },
            inputDisabledBorder: 'solid 1px var(--ag-border-color)',
            inputInvalidBorder: {
                width: 2,
                color: {
                    ref: 'invalidColor',
                    mix: 0.3,
                },
            },
        })
        .addCss(inputStyleUnderlinedCSS);
