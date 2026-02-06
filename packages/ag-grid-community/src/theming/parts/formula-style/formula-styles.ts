import type { Part } from '../../../agStack/theming/part';
import { createPart } from '../../../agStack/theming/partImpl';
import type { BorderValue, ColorValue } from '../../../agStack/theming/themeTypes';

type FormulaStyleParams = {
    /**
     * The color of the 1st formula field token
     */
    formulaToken1Color: ColorValue;
    /**
     * The background color of the 1st formula field token associated range
     */
    formulaToken1BackgroundColor: ColorValue;
    /**
     * The border of the 1st formula field token associated range
     */
    formulaToken1Border: BorderValue;
    /**
     * The color of the 2nd formula field token
     */
    formulaToken2Color: ColorValue;
    /**
     * The background color of the 2nd formula field token associated range
     */
    formulaToken2BackgroundColor: ColorValue;
    /**
     * The border of the 2nd formula field token associated range
     */
    formulaToken2Border: BorderValue;
    /**
     * The color of the 3rd formula field token
     */
    formulaToken3Color: ColorValue;
    /**
     * The background color of the 3rd formula field token associated range
     */
    formulaToken3BackgroundColor: ColorValue;
    /**
     * The border of the 3rd formula field token associated range
     */
    formulaToken3Border: BorderValue;
    /**
     * The color of the 4th formula field token
     */
    formulaToken4Color: ColorValue;
    /**
     * The background color of the 4th formula field token associated range
     */
    formulaToken4BackgroundColor: ColorValue;
    /**
     * The border of the 4th formula field token associated range
     */
    formulaToken4Border: BorderValue;
    /**
     * The color of the 5th formula field token
     */
    formulaToken5Color: ColorValue;
    /**
     * The background color of the 5th formula field token associated range
     */
    formulaToken5BackgroundColor: ColorValue;
    /**
     * The border of the 5th formula field token associated range
     */
    formulaToken5Border: BorderValue;
    /**
     * The color of the 6th formula field token
     */
    formulaToken6Color: ColorValue;
    /**
     * The background color of the 6th formula field token associated range
     */
    formulaToken6BackgroundColor: ColorValue;
    /**
     * The border of the 6th formula field token associated range
     */
    formulaToken6Border: BorderValue;

    /**
     * The color of the 7th formula field token
     */
    formulaToken7Color: ColorValue;
    /**
     * The background color of the 7th formula field token associated range
     */
    formulaToken7BackgroundColor: ColorValue;
    /**
     * The border of the 7th formula field token associated range
     */
    formulaToken7Border: BorderValue;
};

const baseParams: FormulaStyleParams = {
    formulaToken1Color: '#3269c6',
    formulaToken1BackgroundColor: { ref: 'formulaToken1Color', mix: 0.08 },
    formulaToken1Border: {
        color: {
            ref: 'formulaToken1Color',
        },
    },

    formulaToken2Color: '#c0343f',
    formulaToken2BackgroundColor: { ref: 'formulaToken2Color', mix: 0.06 },
    formulaToken2Border: {
        color: {
            ref: 'formulaToken2Color',
        },
    },

    formulaToken3Color: '#8156b8',
    formulaToken3BackgroundColor: { ref: 'formulaToken3Color', mix: 0.08 },
    formulaToken3Border: {
        color: {
            ref: 'formulaToken3Color',
        },
    },

    formulaToken4Color: '#007c1f',
    formulaToken4BackgroundColor: { ref: 'formulaToken4Color', mix: 0.06 },
    formulaToken4Border: {
        color: {
            ref: 'formulaToken4Color',
        },
    },

    formulaToken5Color: '#b03e85',
    formulaToken5BackgroundColor: { ref: 'formulaToken5Color', mix: 0.08 },
    formulaToken5Border: {
        color: {
            ref: 'formulaToken5Color',
        },
    },

    formulaToken6Color: '#b74900',
    formulaToken6BackgroundColor: { ref: 'formulaToken6Color', mix: 0.06 },
    formulaToken6Border: {
        color: {
            ref: 'formulaToken6Color',
        },
    },

    formulaToken7Color: '#247492',
    formulaToken7BackgroundColor: { ref: 'formulaToken7Color', mix: 0.08 },
    formulaToken7Border: {
        color: {
            ref: 'formulaToken7Color',
        },
    },
};

const makeBatchEditStyleBaseTreeShakeable = () =>
    createPart<FormulaStyleParams>({
        feature: 'formulaStyle',
        params: baseParams,
    });

export const formulaStyleBase: Part<FormulaStyleParams> = /*#__PURE__*/ makeBatchEditStyleBaseTreeShakeable();
