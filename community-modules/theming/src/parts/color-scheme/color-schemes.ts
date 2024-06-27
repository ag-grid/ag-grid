import { opaqueForeground } from '../../css-helpers';
import { definePart } from '../../theme-utils';

export const colorSchemeLightNeutral = definePart({
    partId: 'colorScheme',
    variantId: 'lightNeutral',
    overrideParams: {},
});

export const colorSchemeLightWarm = definePart({
    partId: 'colorScheme',
    variantId: 'lightWarm',
    overrideParams: {
        foregroundColor: '#000000de',
        borderColor: '#60300026',
        chromeBackgroundColor: '#60300005',
    },
});

export const colorSchemeLightCold = definePart({
    partId: 'colorScheme',
    variantId: 'lightCold',
    overrideParams: {
        foregroundColor: '#000',
        backgroundColor: '#fff',
        chromeBackgroundColor: '#f3f8f8',
    },
});

export const colorSchemeDarkNeutral = definePart({
    partId: 'colorScheme',
    variantId: 'darkNeutral',
    overrideParams: {
        backgroundColor: 'hsl(217, 0%, 17%)',
        foregroundColor: '#FFF',
        chromeBackgroundColor: opaqueForeground(0.05),
    },
});

export const colorSchemeDarkWarm = definePart({
    partId: 'colorScheme',
    variantId: 'darkWarm',
    overrideParams: {
        backgroundColor: 'hsl(29, 10%, 17%)',
        foregroundColor: '#FFF',
        chromeBackgroundColor: opaqueForeground(0.05),
    },
});

export const colorSchemeDarkBlue = definePart({
    partId: 'colorScheme',
    variantId: 'darkBlue',
    overrideParams: {
        backgroundColor: '#1f2836',
        foregroundColor: '#FFF',
        chromeBackgroundColor: opaqueForeground(0.07),
    },
});

export const allColorSchemes = [
    colorSchemeLightNeutral,
    colorSchemeLightWarm,
    colorSchemeLightCold,
    colorSchemeDarkNeutral,
    colorSchemeDarkWarm,
    colorSchemeDarkBlue,
];
