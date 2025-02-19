import { createPart } from '../../Part';
import type { Part } from '../../Part';
import type { BorderValue, ColorValue, FontWeightValue, LengthValue } from '../../theme-types';
import { accentColor, backgroundColor, foregroundBackgroundMix, foregroundColor } from '../../theme-utils';
import { buttonStyleBaseCSS } from './button-style-base.css-GENERATED';

export type ButtonStyleParams = {
    /**
     * Text color of standard action buttons (e.g. "Reset" and "Apply")
     */
    buttonTextColor: ColorValue;

    /**
     * Font weight of standard action buttons (e.g. "Reset" and "Apply")
     */
    buttonFontWeight: FontWeightValue;

    /**
     * Background color of standard action buttons (e.g. "Reset" and "Apply")
     */
    buttonBackgroundColor: ColorValue;

    /**
     * Border around standard action buttons (e.g. "Reset" and "Apply")
     */
    buttonBorder: BorderValue;

    /**
     * Corner radius of standard action buttons (e.g. "Reset" and "Apply")
     */
    buttonBorderRadius: LengthValue;

    /**
     * Horizontal padding inside standard action buttons (e.g. "Reset" and "Apply")
     */
    buttonHorizontalPadding: LengthValue;

    /**
     * Vertical padding inside standard action buttons (e.g. "Reset" and "Apply")
     */
    buttonVerticalPadding: LengthValue;

    /**
     * Text color of standard action buttons (e.g. "Reset" and "Apply") when hovered
     */
    buttonHoverTextColor: ColorValue;

    /**
     * Background color of standard action buttons (e.g. "Reset" and "Apply") when hovered
     */
    buttonHoverBackgroundColor: ColorValue;

    /**
     * Border around standard action buttons (e.g. "Reset" and "Apply") when hovered. Only has an effect if a border is enabled with `buttonBorder`.
     */
    buttonHoverBorder: BorderValue;

    /**
     * Text color of standard action buttons (e.g. "Reset" and "Apply") when being clicked
     */
    buttonActiveTextColor: ColorValue;

    /**
     * Background color of standard action buttons (e.g. "Reset" and "Apply") when being clicked
     */
    buttonActiveBackgroundColor: ColorValue;

    /**
     * Border around standard action buttons (e.g. "Reset" and "Apply") when being clicked.
     */
    buttonActiveBorder: BorderValue;

    /**
     * Text color of standard action buttons (e.g. "Reset" and "Apply") when disabled
     */
    buttonDisabledTextColor: ColorValue;

    /**
     * Background color of standard action buttons (e.g. "Reset" and "Apply") when disabled
     */
    buttonDisabledBackgroundColor: ColorValue;

    /**
     * Border around standard action buttons (e.g. "Reset" and "Apply") when disabled.
     */
    buttonDisabledBorder: BorderValue;
};

const baseParams: ButtonStyleParams = {
    buttonTextColor: 'inherit',
    buttonFontWeight: 'normal',
    buttonBackgroundColor: 'transparent',
    buttonBorder: false,
    buttonBorderRadius: { ref: 'borderRadius' },
    buttonHorizontalPadding: { calc: 'spacing * 2' },
    buttonVerticalPadding: { ref: 'spacing' },
    buttonHoverTextColor: { ref: 'buttonTextColor' },
    buttonHoverBackgroundColor: { ref: 'buttonBackgroundColor' },
    buttonHoverBorder: { ref: 'buttonBorder' },
    buttonActiveTextColor: { ref: 'buttonHoverTextColor' },
    buttonActiveBackgroundColor: { ref: 'buttonHoverBackgroundColor' },
    buttonActiveBorder: { ref: 'buttonHoverBorder' },
    buttonDisabledTextColor: { ref: 'inputDisabledTextColor' },
    buttonDisabledBackgroundColor: { ref: 'inputDisabledBackgroundColor' },
    buttonDisabledBorder: { ref: 'inputDisabledBorder' },
};

const makeButtonStyleBaseTreeShakeable = () =>
    createPart<ButtonStyleParams>({
        feature: 'buttonStyle',
        params: baseParams,
        css: buttonStyleBaseCSS,
    });

export const buttonStyleBase: Part<ButtonStyleParams> = /*#__PURE__*/ makeButtonStyleBaseTreeShakeable();

const makeButtonStyleQuartzTreeShakeable = () =>
    createPart<ButtonStyleParams>({
        feature: 'buttonStyle',
        params: {
            ...baseParams,
            buttonBackgroundColor: backgroundColor,
            buttonBorder: true,
            buttonHoverBackgroundColor: { ref: 'rowHoverColor' },
            buttonActiveBorder: { color: accentColor },
        },
        css: buttonStyleBaseCSS,
    });

export const buttonStyleQuartz: Part<ButtonStyleParams> = /*#__PURE__*/ makeButtonStyleQuartzTreeShakeable();

const makeButtonStyleAlpineTreeShakeable = () =>
    createPart<ButtonStyleParams>({
        feature: 'buttonStyle',
        params: {
            ...baseParams,
            buttonBackgroundColor: backgroundColor,
            buttonBorder: { color: accentColor },
            buttonFontWeight: 600,
            buttonTextColor: accentColor,
            buttonHoverBackgroundColor: { ref: 'rowHoverColor' },
            buttonActiveBackgroundColor: accentColor,
            buttonActiveTextColor: backgroundColor,
        },
        css: buttonStyleBaseCSS,
    });

export const buttonStyleAlpine: Part<ButtonStyleParams> = /*#__PURE__*/ makeButtonStyleAlpineTreeShakeable();

const makeButtonStyleBalhamTreeShakeable = () =>
    createPart<ButtonStyleParams>({
        feature: 'buttonStyle',
        params: {
            ...baseParams,
            buttonBorder: { color: foregroundColor, width: 2, style: 'outset' },
            buttonActiveBorder: { color: foregroundColor, width: 2, style: 'inset' },
            buttonBackgroundColor: foregroundBackgroundMix(0.07),
            buttonHoverBackgroundColor: backgroundColor,
            buttonVerticalPadding: { calc: 'spacing * 0.5' },
        },
        css: buttonStyleBaseCSS,
    });

export const buttonStyleBalham: Part<ButtonStyleParams> = /*#__PURE__*/ makeButtonStyleBalhamTreeShakeable();
