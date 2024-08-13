import { createPart } from '../../../theme-types';
import { getQuartzIconsCss } from './quartz-icon-data';

// prettier-ignore
export const iconSetQuartz = (args: { strokeWidth?: number } = {}) =>
    /*#__PURE__*/
    createPart('iconSet', 'quartz')
        .addCss(() => getQuartzIconsCss(args));

// prettier-ignore
export const iconSetQuartzLight =
    /*#__PURE__*/
    createPart('iconSet', 'quartzLight')
        .addCss(() => getQuartzIconsCss({ strokeWidth: 1 }));

// prettier-ignore
export const iconSetQuartzRegular =
    /*#__PURE__*/
    createPart('iconSet', 'quartzRegular')
        .addCss(getQuartzIconsCss);

// prettier-ignore
export const iconSetQuartzBold =
    /*#__PURE__*/
    createPart('iconSet', 'quartzBold')
        .addCss(() => getQuartzIconsCss({ strokeWidth: 2 }));
