import { expect, it } from 'vitest';

import { STUDIO_FONT_FAMILY_OPTIONS } from './fonts';
import { PRESETS } from './presets';

const isFontFamilyKey = (key: string) => key === 'fontFamily' || key.endsWith('FontFamily');

const presetFonts = PRESETS.flatMap((preset) =>
    (['light', 'dark'] as const).flatMap((mode) => {
        const { params } = preset.variants[mode];
        return Object.keys(params)
            .filter(isFontFamilyKey)
            .map((key) => ({ where: `${preset.id} (${mode}) ${key}`, value: params[key] }));
    })
);

// An unmatched value changes the font while the dropdown reports it as
// inherited - see fonts.ts.
it('presets only set font families offered by the Font Family dropdown', () => {
    const optionValues = STUDIO_FONT_FAMILY_OPTIONS.map((option) => option.value);

    expect(presetFonts.length).toBeGreaterThan(0);
    for (const { where, value } of presetFonts) {
        expect(optionValues, `${where} is not a Font Family dropdown option`).toContainEqual(value);
    }
});
