import { createPart } from '../../../../Part';
import { getQuartzIconsCss } from './quartz-icon-data';

// prettier-ignore
export const iconSetQuartz = (args: { strokeWidth?: number } = {}) =>
    /*#__PURE__*/
    createPart({feature: 'iconSet', variant: 'quartz'})
        .withCSS(() => getQuartzIconsCss(args));

// prettier-ignore
export const iconSetQuartzLight =
    /*#__PURE__*/
    createPart({feature: 'iconSet', variant: 'quartzLight'})
        .withCSS(() => getQuartzIconsCss({ strokeWidth: 1 }));

// prettier-ignore
export const iconSetQuartzRegular =
    /*#__PURE__*/
    createPart({feature: 'iconSet', variant: 'quartzRegular'})
        .withCSS(getQuartzIconsCss);

// prettier-ignore
export const iconSetQuartzBold =
    /*#__PURE__*/
    createPart({feature: 'iconSet', variant: 'quartzBold'})
        .withCSS(() => getQuartzIconsCss({ strokeWidth: 2 }));
