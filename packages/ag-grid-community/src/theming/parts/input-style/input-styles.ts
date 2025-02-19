import { createPart } from '../../Part';
import type { Part } from '../../Part';
import type { BorderValue, ColorValue, LengthValue, ShadowValue } from '../../theme-types';
import { accentColor, backgroundColor, foregroundBackgroundMix, foregroundMix } from '../../theme-utils';
import { inputStyleBaseCSS } from './input-style-base.css-GENERATED';
import { inputStyleBorderedCSS } from './input-style-bordered.css-GENERATED';
import { inputStyleUnderlinedCSS } from './input-style-underlined.css-GENERATED';

export type InputStyleParams = {
    /**
     * Background color for text inputs
     */
    inputBackgroundColor: ColorValue;

    /**
     * Border around text inputs (or underneath, if using the underlined input style)
     */
    inputBorder: BorderValue;

    /**
     * Corner radius of text inputs
     */
    inputBorderRadius: LengthValue;

    /**
     * Background color for disabled text inputs
     */
    inputDisabledBackgroundColor: ColorValue;

    /**
     * Border around disabled text inputs (or underneath, if using the underlined input style)
     */
    inputDisabledBorder: BorderValue;

    /**
     * Color of text within disabled text inputs
     */
    inputDisabledTextColor: ColorValue;

    /**
     * Background color for focussed text inputs
     */
    inputFocusBackgroundColor: ColorValue;

    /**
     * Border around focussed text inputs (or underneath, if using the underlined input style)
     */
    inputFocusBorder: BorderValue;

    /**
     * Shadow around focussed text inputs
     */
    inputFocusShadow: ShadowValue;

    /**
     * Color of text within focussed text inputs
     */
    inputFocusTextColor: ColorValue;

    /**
     * Minimum height of text inputs
     */
    inputHeight: LengthValue;

    /**
     * Background color for text inputs in an invalid state
     */
    inputInvalidBackgroundColor: ColorValue;

    /**
     * Border around text inputs in an invalid state (or underneath, if using the underlined input style)
     */
    inputInvalidBorder: BorderValue;

    /**
     * Color of text within text inputs in an invalid state
     */
    inputInvalidTextColor: ColorValue;

    /**
     * Padding at the start of text in text inputs
     */
    inputPaddingStart: LengthValue;

    /**
     * Color of text within text inputs
     */
    inputTextColor: ColorValue;

    /**
     * Color of placeholder text in empty inputs describing the purpose of the input e.g. "Search..."
     */
    inputPlaceholderTextColor: ColorValue;

    /**
     * Color of search icon within search text inputs
     */
    inputIconColor: ColorValue;

    /**
     * Border around buttons with attached dropdown menus (e.g. select fields)
     */
    pickerButtonBorder: BorderValue;

    /**
     * Border around buttons with attached dropdown menus (e.g. select fields) when focussed
     */
    pickerButtonFocusBorder: BorderValue;

    /**
     * Background color for buttons with attached dropdown menus (e.g. select fields)
     */
    pickerButtonBackgroundColor: ColorValue;

    /**
     * Background color for buttons with attached dropdown menus (e.g. select fields) when focussed
     */
    pickerButtonFocusBackgroundColor: ColorValue;

    /**
     * Border around dropdown menus attached to buttons (e.g. select fields)
     */
    pickerListBorder: BorderValue;

    /**
     * Background color for dropdown menus attached to buttons (e.g. select fields)
     */
    pickerListBackgroundColor: ColorValue;
};

const baseParams: InputStyleParams = {
    inputBackgroundColor: 'transparent',
    inputBorder: false,
    inputBorderRadius: 0,
    inputTextColor: {
        ref: 'textColor',
    },
    inputPlaceholderTextColor: {
        ref: 'inputTextColor',
        mix: 0.5,
    },
    inputPaddingStart: 0,
    inputHeight: {
        calc: 'max(iconSize, fontSize) + spacing * 2',
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
    inputIconColor: {
        ref: 'inputTextColor',
    },
    pickerButtonBorder: false,
    pickerButtonFocusBorder: { ref: 'inputFocusBorder' },
    pickerButtonBackgroundColor: { ref: 'backgroundColor' },
    pickerButtonFocusBackgroundColor: { ref: 'backgroundColor' },
    pickerListBorder: false,
    pickerListBackgroundColor: { ref: 'backgroundColor' },
};

const makeInputStyleBaseTreeShakeable = () =>
    createPart<InputStyleParams>({
        feature: 'inputStyle',
        params: baseParams,
        css: inputStyleBaseCSS,
    });

export const inputStyleBase: Part<InputStyleParams> = /*#__PURE__*/ makeInputStyleBaseTreeShakeable();

const makeInputStyleBorderedTreeShakeable = () =>
    createPart<InputStyleParams>({
        feature: 'inputStyle',
        params: {
            ...baseParams,
            inputBackgroundColor: backgroundColor,
            inputBorder: true,
            inputBorderRadius: {
                ref: 'borderRadius',
            },
            inputPaddingStart: {
                ref: 'spacing',
            },
            inputFocusBorder: {
                color: accentColor,
            },
            inputFocusShadow: {
                ref: 'focusShadow',
            },
            inputDisabledBackgroundColor: foregroundBackgroundMix(0.06),
            inputDisabledTextColor: {
                ref: 'textColor',
                mix: 0.5,
            },
            inputInvalidBorder: {
                color: { ref: 'invalidColor' },
            },
            pickerButtonBorder: true,
            pickerListBorder: true,
        },
        css: () => inputStyleBaseCSS + inputStyleBorderedCSS,
    });

export const inputStyleBordered: Part<InputStyleParams> = /*#__PURE__*/ makeInputStyleBorderedTreeShakeable();

const makeInputStyleUnderlinedTreeShakeable = () =>
    createPart<InputStyleParams>({
        feature: 'inputStyle',
        params: {
            ...baseParams,
            inputBackgroundColor: 'transparent',
            inputBorder: {
                width: 2,
                color: foregroundMix(0.3),
            },
            inputPaddingStart: {
                ref: 'spacing',
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
        },
        css: () => inputStyleBaseCSS + inputStyleUnderlinedCSS,
    });

export const inputStyleUnderlined: Part<InputStyleParams> = /*#__PURE__*/ makeInputStyleUnderlinedTreeShakeable();
