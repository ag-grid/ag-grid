import { createPart } from '../../theme-types';
import { checkboxStyleDefaultCSS } from './GENERATED-checkbox-style-default';

// prettier-ignore
export const checkboxStyleDefault =
    /*#__PURE__*/
    createPart('checkboxStyle', 'default')
        .addParams({
            checkboxBorderWidth: 1,
            checkboxBorderRadius: {
                ref: 'borderRadius',
            },
            checkboxUncheckedBackgroundColor: {
                ref: 'backgroundColor',
            },
            checkboxUncheckedBorderColor: {
                ref: 'foregroundColor',
                mix: 0.3,
                onto: 'backgroundColor',
            },
            checkboxCheckedBackgroundColor: {
                ref: 'accentColor',
            },
            checkboxCheckedBorderColor: {
                ref: 'accentColor',
            },
            checkboxCheckedShapeImage: {
                svg: '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="7" fill="none"><path stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M1 3.5 3.5 6l5-5"/></svg>',
            },
            checkboxCheckedShapeColor: {
                ref: 'backgroundColor',
            },
            checkboxIndeterminateBackgroundColor: {
                ref: 'foregroundColor',
                mix: 0.3,
                onto: 'backgroundColor',
            },
            checkboxIndeterminateBorderColor: {
                ref: 'foregroundColor',
                mix: 0.3,
                onto: 'backgroundColor',
            },
            checkboxIndeterminateShapeImage: {
                svg: '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="2" fill="none"><rect width="10" height="2" fill="#000" rx="1"/></svg>',
            },
            checkboxIndeterminateShapeColor: {
                ref: 'backgroundColor',
            },
            radioCheckedShapeImage: {
                svg: '<svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" fill="none"><circle cx="3" cy="3" r="3" fill="#000"/></svg>',
            },
        })
        .addCss(checkboxStyleDefaultCSS);
