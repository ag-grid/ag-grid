import type { Part } from '../../../agStack/theming/part';
import { createPart } from '../../../agStack/theming/partImpl';
import type { ColorValue } from '../../../agStack/theming/themeTypes';

type FormulaStyleParams = {
    /**
     * The color of the 1st formula field token
     */
    'formulaToken-1Color': ColorValue;
    /**
     * The background color of the 1st formula field token
     */
    'formulaToken-1BackgroundColor': ColorValue;
    /**
     * The color of the 2nd formula field token
     */
    'formulaToken-2Color': ColorValue;
    /**
     * The background color of the 2nd formula field token
     */
    'formulaToken-2BackgroundColor': ColorValue;
    /**
     * The color of the 3rd formula field token
     */
    'formulaToken-3Color': ColorValue;
    /**
     * The background color of the 3rd formula field token
     */
    'formulaToken-3BackgroundColor': ColorValue;
    /**
     * The color of the 4th formula field token
     */
    'formulaToken-4Color': ColorValue;
    /**
     * The background color of the 4h formula field token
     */
    'formulaToken-4BackgroundColor': ColorValue;
    /**
     * The color of the 5th formula field token
     */
    'formulaToken-5Color': ColorValue;
    /**
     * The background color of the 5th formula field token
     */
    'formulaToken-5BackgroundColor': ColorValue;
    /**
     * The color of the 6th formula field token
     */
    'formulaToken-6Color': ColorValue;
    /**
     * The background color of the 6h formula field token
     */
    'formulaToken-6BackgroundColor': ColorValue;
};

const baseParams: FormulaStyleParams = {
    'formulaToken-1Color': '#4c8bf5',
    'formulaToken-1BackgroundColor': 'rgb(76 139 245 / 16%)',

    'formulaToken-2Color': '#e86c60',
    'formulaToken-2BackgroundColor': 'rgb(232 108 96 / 18%)',

    'formulaToken-3Color': '#3fb950',
    'formulaToken-3BackgroundColor': 'rgb(63 185 80 / 16%)',

    'formulaToken-4Color': '#ba68c8',
    'formulaToken-4BackgroundColor': 'rgb(186 104 200 / 16%)',

    'formulaToken-5Color': '#f2993f',
    'formulaToken-5BackgroundColor': 'rgb(242 153 63 / 18%)',

    'formulaToken-6Color': '#2bb3c0',
    'formulaToken-6BackgroundColor': 'rgb(43 179 192 / 16%)',
};

const makeBatchEditStyleBaseTreeShakeable = () =>
    createPart<FormulaStyleParams>({
        feature: 'formulaStyle',
        params: baseParams,
    });

export const formulaStyleBase: Part<FormulaStyleParams> = /*#__PURE__*/ makeBatchEditStyleBaseTreeShakeable();
