import { createPart } from '../../theme-types';

// prettier-ignore
export const colorSchemeLightNeutral =
    /*#__PURE__*/
    createPart({feature: 'colorScheme', variant: 'lightNeutral'});

// prettier-ignore
export const colorSchemeLightWarm =
    /*#__PURE__*/
    createPart({feature: 'colorScheme', variant: 'lightWarm'})
        .overrideParams({
            foregroundColor: '#000000de',
            borderColor: '#60300026',
            chromeBackgroundColor: '#60300005',
        });

// prettier-ignore
export const colorSchemeLightCold =
    /*#__PURE__*/
    createPart({feature: 'colorScheme', variant: 'lightCold'})
        .overrideParams({
            foregroundColor: '#000',
            backgroundColor: '#fff',
            chromeBackgroundColor: '#f3f8f8',
        });

// prettier-ignore
export const colorSchemeDarkNeutral =
    /*#__PURE__*/
    createPart({feature: 'colorScheme', variant: 'darkNeutral'})
        .overrideParams({
            backgroundColor: 'hsl(217, 0%, 17%)',
            foregroundColor: '#FFF',
            chromeBackgroundColor: {
                ref: 'foregroundColor',
                mix: 0.05,
                onto: 'backgroundColor',
            },
        });

// prettier-ignore
export const colorSchemeDarkWarm =
    /*#__PURE__*/
    createPart({feature: 'colorScheme', variant: 'darkWarm'})
        .overrideParams({
            backgroundColor: 'hsl(29, 10%, 17%)',
            foregroundColor: '#FFF',
            chromeBackgroundColor: {
                ref: 'foregroundColor',
                mix: 0.05,
                onto: 'backgroundColor',
            },
        });

// prettier-ignore
export const colorSchemeDarkBlue =
    /*#__PURE__*/
    createPart({feature: 'colorScheme', variant: 'darkBlue'})
        .overrideParams({
            backgroundColor: '#1f2836',
            foregroundColor: '#FFF',
            chromeBackgroundColor: {
                ref: 'foregroundColor',
                mix: 0.07,
                onto: 'backgroundColor',
            },
        });
