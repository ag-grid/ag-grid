import type { Part } from '../../../agStack/theming/part';
import { createPart } from '../../../agStack/theming/partImpl';
import type { BorderValue, ColorValue } from '../../../agStack/theming/themeTypes';

type FormulaStyleParams = {
    /**
     * The border of the formula field token
     */
    formulaTokenBorder: BorderValue;
    /**
     * The color of the 1st formula field token
     */
    formulaToken1Color: ColorValue;
    /**
     * The background color of the 1st formula field token
     */
    formulaToken1BackgroundColor: ColorValue;
    /**
     * The border of the 1st formula field token
     */
    formulaToken1Border: BorderValue;
    /**
     * The color of the 2nd formula field token
     */
    formulaToken2Color: ColorValue;
    /**
     * The background color of the 2nd formula field token
     */
    formulaToken2BackgroundColor: ColorValue;
    /**
     * The border of the 2nd formula field token
     */
    formulaToken2Border: BorderValue;
    /**
     * The color of the 3rd formula field token
     */
    formulaToken3Color: ColorValue;
    /**
     * The background color of the 3rd formula field token
     */
    formulaToken3BackgroundColor: ColorValue;
    /**
     * The border of the 3rd formula field token
     */
    formulaToken3Border: BorderValue;
    /**
     * The color of the 4th formula field token
     */
    formulaToken4Color: ColorValue;
    /**
     * The background color of the 4th formula field token
     */
    formulaToken4BackgroundColor: ColorValue;
    /**
     * The border of the 4th formula field token
     */
    formulaToken4Border: BorderValue;
    /**
     * The color of the 5th formula field token
     */
    formulaToken5Color: ColorValue;
    /**
     * The background color of the 5th formula field token
     */
    formulaToken5BackgroundColor: ColorValue;
    /**
     * The border of the 5th formula field token
     */
    formulaToken5Border: BorderValue;
    /**
     * The color of the 6th formula field token
     */
    formulaToken6Color: ColorValue;
    /**
     * The background color of the 6th formula field token
     */
    formulaToken6BackgroundColor: ColorValue;
    /**
     * The border of the 6th formula field token
     */
    formulaToken6Border: BorderValue;
};

const baseParams: FormulaStyleParams = {
    formulaTokenBorder: true,
    formulaToken1Color: '#4c8bf5',
    formulaToken1BackgroundColor: 'rgb(76 139 245 / 16%)',
    formulaToken1Border: {
        color: {
            ref: 'formulaToken1Color',
        },
    },

    formulaToken2Color: '#e86c60',
    formulaToken2BackgroundColor: 'rgb(232 108 96 / 18%)',
    formulaToken2Border: {
        color: {
            ref: 'formulaToken2Color',
        },
    },

    formulaToken3Color: '#3fb950',
    formulaToken3BackgroundColor: 'rgb(63 185 80 / 16%)',
    formulaToken3Border: {
        color: {
            ref: 'formulaToken3Color',
        },
    },

    formulaToken4Color: '#ba68c8',
    formulaToken4BackgroundColor: 'rgb(186 104 200 / 16%)',
    formulaToken4Border: {
        color: {
            ref: 'formulaToken4Color',
        },
    },

    formulaToken5Color: '#f2993f',
    formulaToken5BackgroundColor: 'rgb(242 153 63 / 18%)',
    formulaToken5Border: {
        color: {
            ref: 'formulaToken5Color',
        },
    },

    formulaToken6Color: '#2bb3c0',
    formulaToken6BackgroundColor: 'rgb(43 179 192 / 16%)',
    formulaToken6Border: {
        color: {
            ref: 'formulaToken6Color',
        },
    },
};

const makeBatchEditStyleBaseTreeShakeable = () =>
    createPart<FormulaStyleParams>({
        feature: 'formulaStyle',
        params: baseParams,
    });

export const formulaStyleBase: Part<FormulaStyleParams> = /*#__PURE__*/ makeBatchEditStyleBaseTreeShakeable();
