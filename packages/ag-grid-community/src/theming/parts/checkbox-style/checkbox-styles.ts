import { createPart } from '../../Part';
import type { Part } from '../../Part';
import type { ColorValue, ImageValue, LengthValue } from '../../theme-types';
import { accentColor, backgroundColor, foregroundBackgroundMix } from '../../theme-utils';
import { checkboxStyleDefaultCSS } from './checkbox-style-default.css-GENERATED';

export type CheckboxStyleParams = {
    /**
     * Border radius for checkboxes
     */
    checkboxBorderRadius: LengthValue;

    /**
     * Border width for checkboxes
     */
    checkboxBorderWidth: LengthValue;

    /**
     * Background color of a checked checkbox
     */
    checkboxCheckedBackgroundColor: ColorValue;

    /**
     * Border color of a checked checkbox
     */
    checkboxCheckedBorderColor: ColorValue;

    /**
     * The color of the check mark on checked checkboxes.
     */
    checkboxCheckedShapeColor: ColorValue;

    /**
     * An image defining the shape of the check mark on checked checkboxes.
     */
    checkboxCheckedShapeImage: ImageValue;

    /**
     * Background color of an indeterminate checkbox
     */
    checkboxIndeterminateBackgroundColor: ColorValue;

    /**
     * Border color of an indeterminate checkbox
     */
    checkboxIndeterminateBorderColor: ColorValue;

    /**
     * The color of the dash mark on indeterminate checkboxes
     */
    checkboxIndeterminateShapeColor: ColorValue;

    /**
     * An image defining the shape of the dash mark on indeterminate checkboxes
     */
    checkboxIndeterminateShapeImage: ImageValue;

    /**
     * Background color of an unchecked checkbox
     */
    checkboxUncheckedBackgroundColor: ColorValue;

    /**
     * Border color of an unchecked checkbox
     */
    checkboxUncheckedBorderColor: ColorValue;

    /**
     * An image defining the shape of the mark on checked radio buttons
     */
    radioCheckedShapeImage: ImageValue;
};

const makeCheckboxStyleDefaultTreeShakeable = () =>
    createPart<CheckboxStyleParams>({
        feature: 'checkboxStyle',
        params: {
            checkboxBorderWidth: 1,
            checkboxBorderRadius: {
                ref: 'borderRadius',
            },
            checkboxUncheckedBackgroundColor: backgroundColor,
            checkboxUncheckedBorderColor: foregroundBackgroundMix(0.3),
            checkboxCheckedBackgroundColor: accentColor,
            checkboxCheckedBorderColor: { ref: 'checkboxCheckedBackgroundColor' },
            checkboxCheckedShapeImage: {
                svg: '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="7" fill="none"><path stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M1 3.5 3.5 6l5-5"/></svg>',
            },
            checkboxCheckedShapeColor: backgroundColor,
            checkboxIndeterminateBackgroundColor: foregroundBackgroundMix(0.3),
            checkboxIndeterminateBorderColor: { ref: 'checkboxIndeterminateBackgroundColor' },
            checkboxIndeterminateShapeImage: {
                svg: '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="2" fill="none"><rect width="10" height="2" fill="#000" rx="1"/></svg>',
            },
            checkboxIndeterminateShapeColor: backgroundColor,
            radioCheckedShapeImage: {
                svg: '<svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" fill="none"><circle cx="3" cy="3" r="3" fill="#000"/></svg>',
            },
        },
        css: checkboxStyleDefaultCSS,
    });

export const checkboxStyleDefault: Part<CheckboxStyleParams> = /*#__PURE__*/ makeCheckboxStyleDefaultTreeShakeable();
