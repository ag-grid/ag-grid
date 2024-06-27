import { calc, opaqueForeground, ref, refBorder, transparentForeground, transparentRef } from '../../css-helpers';
import { definePart, extendPart } from '../../theme-utils';
import { inputStyleBaseCSS } from './GENERATED-input-style-base';
import { inputStyleUnderlinedCSS } from './GENERATED-input-style-underlined';

export const inputStyleBase = definePart({
    partId: 'inputStyle',
    variantId: 'base',
    additionalParams: {
        inputBackgroundColor: 'transparent',
        inputBorder: false,
        inputBorderRadius: '0',
        inputTextColor: ref('textColor'),
        inputPaddingStart: '0',
        inputHeight: calc('max(iconSize, fontSize) + gridSize * 2'),

        inputFocusBackgroundColor: ref('inputBackgroundColor'),
        inputFocusBorder: ref('inputBorder'),
        inputFocusShadow: 'none',
        inputFocusTextColor: ref('inputTextColor'),

        inputDisabledBackgroundColor: ref('inputBackgroundColor'),
        inputDisabledBorder: ref('inputBorder'),
        inputDisabledTextColor: ref('inputTextColor'),

        inputInvalidBackgroundColor: ref('inputBackgroundColor'),
        inputInvalidBorder: ref('inputBorder'),
        inputInvalidTextColor: ref('inputTextColor'),
    },
    css: [inputStyleBaseCSS],
});

export const inputStyleBordered = extendPart(inputStyleBase, {
    variantId: 'bordered',
    overrideParams: {
        inputBackgroundColor: ref('backgroundColor'),
        inputBorder: true,
        inputBorderRadius: ref('borderRadius'),
        inputPaddingStart: ref('gridSize'),
        inputFocusBorder: refBorder('accentColor'),
        inputFocusShadow: ref('focusShadow'),

        inputDisabledBackgroundColor: opaqueForeground(0.06),
        inputDisabledTextColor: transparentRef('textColor', 0.5),
        inputInvalidBorder: refBorder('invalidColor'),
    },
});

export const inputStyleUnderlined = extendPart(inputStyleBase, {
    variantId: 'underlined',
    overrideParams: {
        inputBorder: 'solid 2px ' + transparentForeground(0.3),
        inputPaddingStart: ref('gridSize'),

        inputFocusBorder: 'solid 2px var(--ag-accent-color)',

        inputDisabledTextColor: transparentRef('textColor', 0.5),
        inputDisabledBorder: 'solid 1px var(--ag-border-color)',

        // TODO inline syntax 'solid 2px var(invalidColor)' would work well here
        inputInvalidBorder: 'solid 2px ' + ref('invalidColor'),
    },
    css: [inputStyleUnderlinedCSS],
});

export const allInputStyles = [inputStyleBase, inputStyleBordered, inputStyleUnderlined];
