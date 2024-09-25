import { createPart } from '../../Part';

const defaultColorParams = {
    backgroundColor: '#fff',
    foregroundColor: '#181d1f',
    borderColor: {
        ref: 'foregroundColor',
        mix: 0.15,
    },
    chromeBackgroundColor: {
        ref: 'foregroundColor',
        mix: 0.02,
        onto: 'backgroundColor',
    },
    browserColorScheme: 'light',
} as const;

export const colorSchemeLight =
    /*#__PURE__*/
    createPart('colorScheme', 'light').withParams(defaultColorParams);

const lightWarmParams = {
    ...defaultColorParams,
    foregroundColor: '#000000de',
    borderColor: '#60300026',
    chromeBackgroundColor: '#60300005',
} as const;

export const colorSchemeLightWarm =
    /*#__PURE__*/
    createPart('colorScheme', 'lightWarm').withParams(lightWarmParams);

const lightColdParams = {
    ...defaultColorParams,
    foregroundColor: '#000',
    chromeBackgroundColor: '#f3f8f8',
} as const;

export const colorSchemeLightCold =
    /*#__PURE__*/
    createPart('colorScheme', 'lightCold').withParams(lightColdParams);

const darkParams = {
    backgroundColor: 'hsl(217, 0%, 17%)',
    foregroundColor: '#FFF',
    chromeBackgroundColor: {
        ref: 'foregroundColor',
        mix: 0.05,
        onto: 'backgroundColor',
    },
    browserColorScheme: 'dark',
} as const;

export const colorSchemeDark =
    /*#__PURE__*/
    createPart('colorScheme', 'dark').withParams(darkParams);

const darkWarmParams = {
    backgroundColor: 'hsl(29, 10%, 17%)',
    foregroundColor: '#FFF',
    chromeBackgroundColor: {
        ref: 'foregroundColor',
        mix: 0.05,
        onto: 'backgroundColor',
    },
    browserColorScheme: 'dark',
} as const;

export const colorSchemeDarkWarm =
    /*#__PURE__*/
    createPart('colorScheme', 'darkWarm').withParams(darkWarmParams);

const darkBlueParams = {
    backgroundColor: '#1f2836',
    foregroundColor: '#FFF',
    chromeBackgroundColor: {
        ref: 'foregroundColor',
        mix: 0.07,
        onto: 'backgroundColor',
    },
    browserColorScheme: 'dark',
} as const;

export const colorSchemeDarkBlue =
    /*#__PURE__*/
    createPart('colorScheme', 'darkBlue').withParams(darkBlueParams);

export const colorSchemeVariable =
    /*#__PURE__*/
    createPart('colorScheme', 'variable')
        .withParams(defaultColorParams, 'light')
        .withParams(lightWarmParams, 'light-warm')
        .withParams(lightColdParams, 'light-cold')
        .withParams(darkParams, 'dark')
        .withParams(darkWarmParams, 'dark-warm')
        .withParams(darkBlueParams, 'dark-blue');
