import { createPart } from '../../../Part';

// prettier-ignore
export const colorSchemeLight =
    /*#__PURE__*/
    createPart('colorScheme', 'light');

// prettier-ignore
export const colorSchemeLightWarm =
    /*#__PURE__*/
    createPart('colorScheme', 'lightWarm')
        .withParams({
            foregroundColor: '#000000de',
            borderColor: '#60300026',
            chromeBackgroundColor: '#60300005',
        });

// prettier-ignore
export const colorSchemeLightCold =
    /*#__PURE__*/
    createPart('colorScheme', 'lightCold')
        .withParams({
            foregroundColor: '#000',
            backgroundColor: '#fff',
            chromeBackgroundColor: '#f3f8f8',
        });

// prettier-ignore
export const colorSchemeDark =
    /*#__PURE__*/
    createPart('colorScheme', 'dark')
        .withParams({
            backgroundColor: 'hsl(217, 0%, 17%)',
            foregroundColor: '#FFF',
            chromeBackgroundColor: {
                ref: 'foregroundColor',
                mix: 0.05,
                onto: 'backgroundColor',
            },
            browserColorScheme: 'dark',
        });

// prettier-ignore
export const colorSchemeDarkWarm =
    /*#__PURE__*/
    createPart('colorScheme', 'darkWarm')
        .withParams({
            backgroundColor: 'hsl(29, 10%, 17%)',
            foregroundColor: '#FFF',
            chromeBackgroundColor: {
                ref: 'foregroundColor',
                mix: 0.05,
                onto: 'backgroundColor',
            },
            browserColorScheme: 'dark',
        });

// prettier-ignore
export const colorSchemeDarkBlue =
    /*#__PURE__*/
    createPart('colorScheme', 'darkBlue')
        .withParams({
            backgroundColor: '#1f2836',
            foregroundColor: '#FFF',
            chromeBackgroundColor: {
                ref: 'foregroundColor',
                mix: 0.07,
                onto: 'backgroundColor',
            },
            browserColorScheme: 'dark',
        });
