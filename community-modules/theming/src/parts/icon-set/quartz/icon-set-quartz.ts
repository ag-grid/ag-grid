import { definePart } from '../../../theme-utils';
import { getQuartzIconsCss } from './quartz-icon-data';

export const iconSetQuartz = (args: { strokeWidth?: number } = {}) =>
    definePart({
        partId: 'iconSet',
        variantId: 'quartz',
        css: [() => getQuartzIconsCss(args)],
    });

export const iconSetQuartzLight = definePart({
    partId: 'iconSet',
    variantId: 'quartzLight',
    css: [() => getQuartzIconsCss({ strokeWidth: 1 })],
});

export const iconSetQuartzRegular = definePart({
    partId: 'iconSet',
    variantId: 'quartzRegular',
    css: [getQuartzIconsCss],
});

export const iconSetQuartzBold = definePart({
    partId: 'iconSet',
    variantId: 'quartzBold',
    css: [() => getQuartzIconsCss({ strokeWidth: 2 })],
});
